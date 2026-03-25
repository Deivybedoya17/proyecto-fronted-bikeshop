import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BicicletaService } from '../../../core/services/bicicleta.service';
import { BicicletaDtoResponse } from '../../../core/models/bicicleta.dto';

const TIPOS = ['CARRETERA', 'MONTANA', 'HIBRIDAS', 'GRAVEL', 'PLEGABLES', 'ELETRICAS'] as const;

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CurrencyPipe, ReactiveFormsModule],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.scss'
})
export class InventarioComponent implements OnInit {
  private readonly svc = inject(BicicletaService);
  private readonly fb  = inject(FormBuilder);

  protected readonly items    = signal<BicicletaDtoResponse[]>([]);
  protected readonly loading  = signal(true);
  protected readonly saving   = signal(false);
  protected readonly showForm = signal(false);
  protected readonly editId   = signal<string | null>(null);

  protected readonly tipos = TIPOS;

  protected readonly form = this.fb.group({
    codigo:        ['', Validators.required],
    marca:         ['', Validators.required],
    modelo:        ['', Validators.required],
    tipo:          ['', Validators.required],
    valorUnitario: [null as number | null, [Validators.required, Validators.min(1)]],
  });

  protected get activos()   { return this.items().filter(b =>  b.activo).length; }
  protected get inactivos() { return this.items().filter(b => !b.activo).length; }

  ngOnInit(): void { this.load(); }

  private load(): void {
    this.loading.set(true);
    this.svc.listarTodo().subscribe({
      next: data => { this.items.set(data); this.loading.set(false); },
      error: ()   => this.loading.set(false)
    });
  }

  abrirFormNuevo(): void {
    this.editId.set(null);
    this.form.reset();
    this.showForm.set(true);
  }

  editarBicicleta(b: BicicletaDtoResponse): void {
    this.editId.set(b.id);
    this.form.patchValue({
      codigo: b.codigo, marca: b.marca, modelo: b.modelo,
      tipo: b.tipo, valorUnitario: b.valorUnitario
    });
    this.showForm.set(true);
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const dto: any = { ...this.form.getRawValue() };
    const id = this.editId();
    const op$ = id ? this.svc.actualizar(id, dto) : this.svc.crear(dto);
    op$.subscribe({
      next: () => { this.saving.set(false); this.showForm.set(false); this.load(); },
      error: ()  => this.saving.set(false)
    });
  }

  cancelar(): void { this.showForm.set(false); }

  eliminar(id: string): void {
    if (!confirm('¿Deseas eliminar esta bicicleta?')) return;
    this.svc.eliminar(id).subscribe(() =>
      this.items.update(list => list.filter(b => b.id !== id))
    );
  }
}
