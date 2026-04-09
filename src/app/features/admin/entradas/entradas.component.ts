import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { EntradaService } from '../../../core/services/entrada.service';
import { ProveedorService } from '../../../core/services/proveedor.service';
import { BicicletaService } from '../../../core/services/bicicleta.service';
import { AuthService } from '../../../core/services/auth.service';
import { EntradaDtoResponse, ProveedorDtoResponse } from '../../../core/models/inventario.dto';
import { BicicletaDtoResponse } from '../../../core/models/bicicleta.dto';

@Component({
  selector: 'app-entradas',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, FormsModule],
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

  // ── Filtros de tabla ──
  protected filterProveedor = '';
  protected filterFechaInicio = '';
  protected filterFechaFin = '';
  protected readonly filteredItems = computed(() => {
    let data = [...this.items()];
    if (this.filterProveedor) {
      data = data.filter(e => e.nombreProveedor === this.filterProveedor);
    }
    if (this.filterFechaInicio) {
      data = data.filter(e => e.fecha.substring(0, 10) >= this.filterFechaInicio);
    }
    if (this.filterFechaFin) {
      data = data.filter(e => e.fecha.substring(0, 10) <= this.filterFechaFin);
    }
    data.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    return data;
  });

  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(5);

  protected readonly totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.filteredItems().length / this.pageSize()));
  });

  protected readonly paginatedItems = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredItems().slice(start, start + this.pageSize());
  });

  // ── Lista única de proveedores para el filtro ──
  protected readonly proveedoresUnicos = computed(() => {
    const nombres = new Set(this.items().map(e => e.nombreProveedor));
    return Array.from(nombres).sort();
  });

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
    return this.form.get('items') as any;
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
    this.proveedorSvc.listarTodos().subscribe(ps => this.proveedores.set(ps.filter(p => p.activo)));
    this.biciSvc.listarTodo().subscribe(bs => this.bicicletas.set(bs.filter(b => b.activo)));
  }

  private load(): void {
    this.loading.set(true);
    this.svc.listarTodas().subscribe({
      next: data => { 
        this.items.set(data); 
        this.loading.set(false);
        this.currentPage.set(1);
      },
      error: ()   => this.loading.set(false)
    });
  }

  aplicarFiltros(): void {
    this.items.update(list => [...list]);
    this.currentPage.set(1);
  }

  limpiarFiltros(): void {
    this.filterProveedor = '';
    this.filterFechaInicio = '';
    this.filterFechaFin = '';
    this.items.update(list => [...list]);
    this.currentPage.set(1);
  }

  abrirForm() {
    this.form.reset();
    this.itemsFormArray.clear();
    this.agregarItem();
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
        this.load();
      },
      error: () => {
        this.saving.set(false);
        alert('Error al registrar la entrada');
      }
    });
  }
}
