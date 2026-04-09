import { Component, OnInit, inject, signal, computed } from '@angular/core';
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
  private readonly fb = inject(FormBuilder);

  protected readonly items = signal<BicicletaDtoResponse[]>([]);
  
  // -- Paginación y Filtrado --
  protected readonly searchTerm = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(5);

  protected readonly filteredItems = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.items().filter(b => 
      b.codigo.toLowerCase().includes(term) ||
      b.marca.toLowerCase().includes(term) ||
      b.modelo.toLowerCase().includes(term) ||
      b.tipo.toLowerCase().includes(term)
    );
  });

  protected readonly totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.filteredItems().length / this.pageSize()));
  });

  protected readonly paginatedItems = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredItems().slice(start, start + this.pageSize());
  });

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly showForm = signal(false);
  protected readonly editId = signal<string | null>(null);

  protected readonly tipos = TIPOS;

  protected readonly form = this.fb.group({
    codigo: ['', Validators.required],
    marca: ['', Validators.required],
    modelo: ['', Validators.required],
    tipo: ['', Validators.required],
    valorUnitario: [null as number | null, [Validators.required, Validators.min(1)]],
  });

  protected get activos() { return this.items().filter(b => b.activo).length; }
  protected get inactivos() { return this.items().filter(b => !b.activo).length; }

  formatTipo(t: string): string {
    return t === 'MONTANA' ? 'MONTAÑA' : t;
  }

  ngOnInit(): void { this.load(); }

  private load(): void {
    this.loading.set(true);
    this.svc.listarTodo().subscribe({
      next: data => { 
        this.items.set(data); 
        this.loading.set(false);
        this.currentPage.set(1); // Reset page on data load
      },
      error: () => this.loading.set(false)
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
      error: () => this.saving.set(false)
    });
  }

  cancelar(): void { this.showForm.set(false); }

  cambiarEstado(b: BicicletaDtoResponse): void {
    const op = b.activo ? this.svc.desactivar(b.id) : this.svc.activar(b.id);
    op.subscribe({
      next: updated => this.items.update(list => list.map(x => x.id === updated.id ? updated : x)),
      error: () => alert('Error al cambiar el estado. El Backend aún no soporta este Endpoint.')
    });
  }

  eliminar(id: string): void {
    const b = this.items().find(x => x.id === id);
    if (b && b.stock > 0) {
      if (!confirm(`⚠️ ALERTA ROJA: La bicicleta ${b.codigo} tiene (${b.stock}) unidades en stock.\n\n¿Estás absolutamente seguro de que deseas eliminar este registro perdiendo la trazabilidad del inventario?`)) {
        return;
      }
    } else {
      if (!confirm('¿Deseas eliminar esta bicicleta permanentemente?')) return;
    }
    
    this.svc.eliminar(id).subscribe(() =>
      this.items.update(list => list.filter(x => x.id !== id))
    );
  }
}
