import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe, SlicePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { SalidaService } from '../../../core/services/salida.service';
import { BicicletaService } from '../../../core/services/bicicleta.service';
import { AuthService } from '../../../core/services/auth.service';
import { SalidaDtoResponse, SalidaBajaDtoRequest } from '../../../core/models/inventario.dto';
import { BicicletaDtoResponse } from '../../../core/models/bicicleta.dto';

@Component({
  selector: 'app-salidas',
  standalone: true,
  imports: [DatePipe, SlicePipe, ReactiveFormsModule, FormsModule],
  templateUrl: './salidas.component.html',
  styleUrl: './salidas.component.scss'
})
export class SalidasComponent implements OnInit {
  private readonly svc     = inject(SalidaService);
  private readonly biciSvc = inject(BicicletaService);
  private readonly authSvc = inject(AuthService);
  private readonly fb      = inject(FormBuilder);

  protected readonly items      = signal<SalidaDtoResponse[]>([]);
  protected readonly bicicletas = signal<BicicletaDtoResponse[]>([]);
  protected readonly loading    = signal(true);
  
  protected readonly showForm = signal(false);
  protected readonly saving   = signal(false);

  // ── Filtros de tabla ──
  protected filterTipo = '';
  protected filterFechaInicio = '';
  protected filterFechaFin = '';


  // ── Items filtrados y ordenados por fecha desc ──
  protected readonly filteredItems = computed(() => {
    let data = [...this.items()];

    // Filtro por tipo (VENTA, BAJA)
    if (this.filterTipo) {
      data = data.filter(s => s.tipoSalida === this.filterTipo);
    }

    // Filtro por rango de fechas
    if (this.filterFechaInicio) {
      data = data.filter(s => s.fecha.substring(0, 10) >= this.filterFechaInicio);
    }
    if (this.filterFechaFin) {
      data = data.filter(s => s.fecha.substring(0, 10) <= this.filterFechaFin);
    }

    // Ordenar por fecha descendente
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

  protected readonly form = this.fb.group({
    idBicicleta: ['', Validators.required],
    cantidad:    [1, [Validators.required, Validators.min(1)]],
    observacion: ['', Validators.required]
  });

  ngOnInit(): void {
    this.load();
    this.biciSvc.listarTodo().subscribe(bs => this.bicicletas.set(bs.filter(b => b.activo && b.stock > 0)));
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
    this.filterTipo = '';
    this.filterFechaInicio = '';
    this.filterFechaFin = '';
    this.items.update(list => [...list]);
    this.currentPage.set(1);
  }

  abrirForm() {
    this.form.reset({ cantidad: 1 });
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
    const formVals = this.form.getRawValue();

    const payload: SalidaBajaDtoRequest = {
      idBicicleta: formVals.idBicicleta!,
      idUsuario: this.authSvc.userId()!,
      cantidad: Number(formVals.cantidad),
      observacion: formVals.observacion || undefined
    };

    this.svc.registrarBaja(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.load();
        this.biciSvc.listarTodo().subscribe(bs => this.bicicletas.set(bs.filter(b => b.activo && b.stock > 0)));
      },
      error: () => {
        this.saving.set(false);
        alert('Error al procesar la salida de inventario');
      }
    });
  }
}
