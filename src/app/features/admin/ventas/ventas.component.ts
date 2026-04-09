import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CurrencyPipe, DatePipe, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentaService } from '../../../core/services/venta.service';
import { ReporteService } from '../../../core/services/reporte.service';
import { VentaDtoResponse } from '../../../core/models/venta.dto';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, SlicePipe, FormsModule],
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.scss'
})
export class VentasComponent implements OnInit {
  private readonly svc     = inject(VentaService);
  private readonly reporteSvc = inject(ReporteService);
  protected readonly ventas = signal<VentaDtoResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly expandido = signal<string | null>(null);

  // ── Filtros de tabla ──
  protected filterUsuario = '';
  protected filterFechaInicio = '';
  protected filterFechaFin = '';

  // ── Paginación ──
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(8); // Mostrar 8 ventas por página

  // ── Items filtrados y ordenados por fecha desc ──
  protected readonly filteredItems = computed(() => {
    let data = [...this.ventas()];

    // Filtro por usuario
    if (this.filterUsuario) {
      data = data.filter(v => v.nombreUsuario === this.filterUsuario);
    }

    // Filtro por rango de fechas
    if (this.filterFechaInicio) {
      data = data.filter(v => v.fecha.substring(0, 10) >= this.filterFechaInicio);
    }
    if (this.filterFechaFin) {
      data = data.filter(v => v.fecha.substring(0, 10) <= this.filterFechaFin);
    }

    // Ordenar por fecha descendente
    data.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    return data;
  });

  // ── Paginación computada ──
  protected readonly totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.filteredItems().length / this.pageSize()));
  });

  protected readonly paginatedItems = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredItems().slice(start, start + this.pageSize());
  });

  // ── Lista única de usuarios para el filtro ──
  protected readonly usuariosUnicos = computed(() => {
    const nombres = new Set(this.ventas().map(v => v.nombreUsuario));
    return Array.from(nombres).sort();
  });

  ngOnInit(): void {
    this.svc.listarTodo().subscribe({
      next: data => { 
        this.ventas.set(data); 
        this.loading.set(false);
        this.currentPage.set(1);
      },
      error: () => this.loading.set(false)
    });
  }

  toggleExpandido(idVenta: string): void {
    this.expandido.update(current => current === idVenta ? null : idVenta);
  }

  aplicarFiltros(): void {
    this.currentPage.set(1); // Resetear a la primera página si cambian los filtros
    this.ventas.update(list => [...list]);
  }

  limpiarFiltros(): void {
    this.filterUsuario = '';
    this.filterFechaInicio = '';
    this.filterFechaFin = '';
    this.aplicarFiltros();
  }

  descargarFactura(idVenta: string): void {
    this.reporteSvc.exportarFacturaPdf(idVenta);
  }
}
