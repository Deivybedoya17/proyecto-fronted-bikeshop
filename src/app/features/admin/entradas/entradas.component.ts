import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { EntradaService } from '../../../core/services/entrada.service';
import { ProveedorService } from '../../../core/services/proveedor.service';
import { BicicletaService } from '../../../core/services/bicicleta.service';
import { AuthService } from '../../../core/services/auth.service';
import { EntradaDtoResponse, ProveedorDtoResponse } from '../../../core/models/inventario.dto';
import { BicicletaDtoResponse } from '../../../core/models/bicicleta.dto';

@Component({
  selector: 'app-entradas',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './entradas.component.html',
  styleUrl: './entradas.component.scss'
})
export class EntradasComponent implements OnInit {
  private readonly svc          = inject(EntradaService);
  private readonly proveedorSvc = inject(ProveedorService);
  private readonly biciSvc      = inject(BicicletaService);
  private readonly authSvc      = inject(AuthService);
  private readonly fb           = inject(FormBuilder);

  protected readonly items       = signal<EntradaDtoResponse[]>([]);
  protected readonly proveedores = signal<ProveedorDtoResponse[]>([]);
  protected readonly bicicletas  = signal<BicicletaDtoResponse[]>([]);
  
  protected readonly loading  = signal(true);
  protected readonly saving   = signal(false);
  protected readonly showForm = signal(false);

  protected readonly form = this.fb.group({
    idProveedor: ['', Validators.required],
    items: this.fb.array([
      this.fb.group({
        idBicicleta: ['', Validators.required],
        cantidad:    [1, [Validators.required, Validators.min(1)]]
      })
    ])
  });

  get itemsFormArray() {
    return this.form.get('items') as any; // Type as any or FormArray to bypass strict typing issues easily in template if needed
  }

  agregarItem() {
    this.itemsFormArray.push(this.fb.group({
      idBicicleta: ['', Validators.required],
      cantidad:    [1, [Validators.required, Validators.min(1)]]
    }));
  }

  removerItem(index: number) {
    if (this.itemsFormArray.length > 1) {
      this.itemsFormArray.removeAt(index);
    }
  }

  ngOnInit(): void {
    this.load();
    // Pre-cargar opciones para los selectores
    this.proveedorSvc.listarTodos().subscribe(ps => this.proveedores.set(ps.filter(p => p.activo)));
    this.biciSvc.listarTodo().subscribe(bs => this.bicicletas.set(bs.filter(b => b.activo)));
  }

  private load(): void {
    this.loading.set(true);
    this.svc.listarTodas().subscribe({
      next: data => { this.items.set(data); this.loading.set(false); },
      error: ()   => this.loading.set(false)
    });
  }

  abrirForm() {
    this.form.reset();
    this.itemsFormArray.clear();
    this.agregarItem(); // Al menos un item
    this.showForm.set(true);
  }

  cerrarForm() {
    this.showForm.set(false);
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const { idProveedor, items } = this.form.getRawValue();

    // Cast the items array to ensure typing matches backend
    const mapItems = (items as any[]).map(i => ({
      idBicicleta: i.idBicicleta,
      cantidad: Number(i.cantidad)
    }));

    const payload = {
      idProveedor: idProveedor! as string,
      idUsuario: this.authSvc.userId()!,
      items: mapItems
    };

    this.svc.registrar(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.load(); // recargar la tabla
      },
      error: () => {
        this.saving.set(false);
        alert('Error al registrar la entrada');
      }
    });
  }
}
