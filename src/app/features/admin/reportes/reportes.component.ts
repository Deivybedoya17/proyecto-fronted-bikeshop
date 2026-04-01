import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReporteService } from '../../../core/services/reporte.service';
import {
  ReporteResumenResponse,
  ReporteVentasPorPeriodoResponse,
  ReporteInventarioResponse,
  ReporteBicicletasTopResponse,
  ReporteMovimientosResponse,
} from '../../../core/models/reporte.dto';

type PestanaReporte = 'resumen' | 'ventas' | 'inventario' | 'top' | 'movimientos';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, DecimalPipe, PercentPipe, FormsModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss',
})
export class ReportesComponent implements OnInit {
  private readonly svc = inject(ReporteService);

  // ── Estado de UI ─────────────────────────────────────────────────────────
  protected readonly pestanaActiva = signal<PestanaReporte>('resumen');
  protected readonly cargando      = signal(false);

  // ── Filtro de fechas ─────────────────────────────────────────────────────
  protected fechaInicio = this.primerDiaMes();
  protected fechaFin    = this.hoy();

  // ── Datos ────────────────────────────────────────────────────────────────
  protected readonly resumen     = signal<ReporteResumenResponse    | null>(null);
  protected readonly ventas      = signal<ReporteVentasPorPeriodoResponse | null>(null);
  protected readonly inventario  = signal<ReporteInventarioResponse | null>(null);
  protected readonly topBici     = signal<ReporteBicicletasTopResponse   | null>(null);
  protected readonly movimientos = signal<ReporteMovimientosResponse     | null>(null);

  // ── Computeds helpers ────────────────────────────────────────────────────
  protected readonly maxIngresos = computed(() => {
    const dias = this.ventas()?.ventasPorDia ?? [];
    return Math.max(...dias.map(d => d.ingresos), 1);
  });

  protected readonly maxUnidades = computed(() => {
    const top = this.topBici()?.top ?? [];
    return Math.max(...top.map(t => t.unidadesVendidas), 1);
  });

  protected readonly maxIngresosTipo = computed(() => {
    const tipos = this.resumen()?.ingresosPorTipo ?? [];
    return Math.max(...tipos.map(t => t.ingresos), 1);
  });

  // ── Ciclo de vida ────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.cargarDatos();
  }

  // ── Métodos Públicos ─────────────────────────────────────────────────────
  seleccionarPestana(p: PestanaReporte): void {
    this.pestanaActiva.set(p);
    this.cargarDatos();
  }

  aplicarFiltro(): void {
    this.cargarDatos();
  }

  // ── Privados ─────────────────────────────────────────────────────────────
  private cargarDatos(): void {
    const p = this.pestanaActiva();
    this.cargando.set(true);

    if (p === 'resumen') {
      this.svc.obtenerResumen(this.fechaInicio, this.fechaFin).subscribe({
        next: d => { this.resumen.set(d);     this.cargando.set(false); },
        error: () => this.cargando.set(false),
      });
    } else if (p === 'ventas') {
      this.svc.ventasPorPeriodo({ fechaInicio: this.fechaInicio, fechaFin: this.fechaFin }).subscribe({
        next: d => { this.ventas.set(d);      this.cargando.set(false); },
        error: () => this.cargando.set(false),
      });
    } else if (p === 'inventario') {
      this.svc.reporteInventario().subscribe({
        next: d => { this.inventario.set(d);  this.cargando.set(false); },
        error: () => this.cargando.set(false),
      });
    } else if (p === 'top') {
      this.svc.topBicicletas(this.fechaInicio, this.fechaFin).subscribe({
        next: d => { this.topBici.set(d);     this.cargando.set(false); },
        error: () => this.cargando.set(false),
      });
    } else if (p === 'movimientos') {
      this.svc.movimientosInventario(this.fechaInicio, this.fechaFin).subscribe({
        next: d => { this.movimientos.set(d); this.cargando.set(false); },
        error: () => this.cargando.set(false),
      });
    }
  }

  private hoy(): string {
    return new Date().toISOString().split('T')[0];
  }

  private primerDiaMes(): string {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  }
}
