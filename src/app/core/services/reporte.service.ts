import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ReporteVentasPorPeriodoRequest,
  ReporteVentasPorPeriodoResponse,
  ReporteInventarioResponse,
  ReporteBicicletasTopResponse,
  ReporteMovimientosResponse,
  ReporteResumenResponse,
} from '../models/reporte.dto';
import { BicicletaDtoResponse } from '../models/bicicleta.dto';

// ──────────────────────────────────────────────────────────────────────────────
// DATOS MOCK — Se reemplazarán con llamadas HTTP reales cuando el backend esté
// ──────────────────────────────────────────────────────────────────────────────
const MOCK_RESUMEN: ReporteResumenResponse = {
  periodoLabel: 'Último mes',
  totalVentas: 87,
  totalIngresos: 214350,
  totalUnidadesVendidas: 124,
  totalEntradas: 45,
  totalSalidas: 12,
  bicicletasActivas: 38,
  stockCritico: 5,
  ingresosPorTipo: [
    { tipo: 'CARRETERA', ingresos: 78200, unidades: 32 },
    { tipo: 'MONTANA', ingresos: 56100, unidades: 41 },
    { tipo: 'ELETRICAS', ingresos: 43800, unidades: 18 },
    { tipo: 'HIBRIDAS', ingresos: 22400, unidades: 19 },
    { tipo: 'GRAVEL', ingresos: 9250, unidades: 9 },
    { tipo: 'PLEGABLES', ingresos: 4600, unidades: 5 },
  ],
};

const MOCK_VENTAS_PERIODO: ReporteVentasPorPeriodoResponse = {
  fechaInicio: '2025-03-01',
  fechaFin: '2025-03-31',
  totalVentas: 87,
  totalIngresos: 214350,
  promedioVentaDiaria: 2.81,
  ventasPorDia: Array.from({ length: 31 }, (_, i) => ({
    fecha: `2025-03-${String(i + 1).padStart(2, '0')}`,
    totalVentas: Math.floor(Math.random() * 6),
    ingresos: Math.floor(Math.random() * 12000),
  })),
};

const MOCK_INVENTARIO: ReporteInventarioResponse = {
  totalBicicletas: 38,
  stockTotal: 312,
  valorTotalInventario: 876400,
  totalStockCritico: 5,
  bicicletasEnStockCritico: [
    { idBicicleta: 'uuid-1', codigo: 'MTB-002', marca: 'Trek', modelo: 'Marlin 6', tipo: 'MONTANA', stockActual: 2, umbralMinimo: 5 },
    { idBicicleta: 'uuid-2', codigo: 'GRAVEL-01', marca: 'Specialized', modelo: 'Diverge E5', tipo: 'GRAVEL', stockActual: 3, umbralMinimo: 5 },
    { idBicicleta: 'uuid-3', codigo: 'ELEC-003', marca: 'Giant', modelo: 'Revolt E+', tipo: 'ELETRICAS', stockActual: 1, umbralMinimo: 5 },
    { idBicicleta: 'uuid-4', codigo: 'FOLD-01', marca: 'Brompton', modelo: 'C Line', tipo: 'PLEGABLES', stockActual: 4, umbralMinimo: 5 },
    { idBicicleta: 'uuid-5', codigo: 'CARR-008', marca: 'Cannondale', modelo: 'CAAD13', tipo: 'CARRETERA', stockActual: 3, umbralMinimo: 5 },
  ],
};

const MOCK_TOP_BICICLETAS: ReporteBicicletasTopResponse = {
  fechaInicio: '2025-03-01',
  fechaFin: '2025-03-31',
  top: [
    { idBicicleta: 'uuid-a', codigo: 'MTB-001', marca: 'Trek', modelo: 'Marlin 5', tipo: 'MONTANA', unidadesVendidas: 18, ingresosGenerados: 43200 },
    { idBicicleta: 'uuid-b', codigo: 'CARR-003', marca: 'Specialized', modelo: 'Allez Sprint', tipo: 'CARRETERA', unidadesVendidas: 14, ingresosGenerados: 38500 },
    { idBicicleta: 'uuid-c', codigo: 'ELEC-001', marca: 'Giant', modelo: 'E+2 Pro', tipo: 'ELETRICAS', unidadesVendidas: 11, ingresosGenerados: 33000 },
    { idBicicleta: 'uuid-d', codigo: 'HBR-002', marca: 'Cannondale', modelo: 'Quick CX', tipo: 'HIBRIDAS', unidadesVendidas: 9, ingresosGenerados: 18900 },
    { idBicicleta: 'uuid-e', codigo: 'GRV-001', marca: 'Trek', modelo: 'Checkpoint AL', tipo: 'GRAVEL', unidadesVendidas: 7, ingresosGenerados: 14700 },
  ],
};

const MOCK_MOVIMIENTOS: ReporteMovimientosResponse = {
  fechaInicio: '2025-03-01',
  fechaFin: '2025-03-31',
  totalEntradas: 45,
  totalSalidas: 12,
  movimientos: [
    { fecha: '2025-03-28', tipo: 'ENTRADA', codigoBicicleta: 'MTB-001', marcaBicicleta: 'Trek', cantidad: 10, responsable: 'Juan Pérez' },
    { fecha: '2025-03-25', tipo: 'SALIDA', codigoBicicleta: 'ELEC-003', marcaBicicleta: 'Giant', cantidad: 2, responsable: 'María García', observacion: 'Baja por daño' },
    { fecha: '2025-03-22', tipo: 'ENTRADA', codigoBicicleta: 'CARR-003', marcaBicicleta: 'Specialized', cantidad: 8, responsable: 'Carlos López' },
    { fecha: '2025-03-18', tipo: 'SALIDA', codigoBicicleta: 'MTB-002', marcaBicicleta: 'Trek', cantidad: 3, responsable: 'Ana Torres', observacion: 'Ajuste conteo' },
    { fecha: '2025-03-14', tipo: 'ENTRADA', codigoBicicleta: 'GRV-001', marcaBicicleta: 'Trek', cantidad: 5, responsable: 'Juan Pérez' },
    { fecha: '2025-03-10', tipo: 'ENTRADA', codigoBicicleta: 'HBR-002', marcaBicicleta: 'Cannondale', cantidad: 6, responsable: 'María García' },
    { fecha: '2025-03-06', tipo: 'SALIDA', codigoBicicleta: 'FOLD-01', marcaBicicleta: 'Brompton', cantidad: 1, responsable: 'Carlos López', observacion: 'Pérdida en traslado' },
  ],
};

// ──────────────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly http         = inject(HttpClient);
  private readonly baseUrl      = `${environment.apiUrl}/reportes`;
  private readonly bicicletaUrl = `${environment.apiUrl}/bicicletas`;


  obtenerResumen(fechaInicio: string, fechaFin: string): Observable<ReporteResumenResponse> {
    return of({ ...MOCK_RESUMEN }).pipe(delay(600));
  }

  ventasPorPeriodo(req: ReporteVentasPorPeriodoRequest): Observable<ReporteVentasPorPeriodoResponse> {
    return of({ ...MOCK_VENTAS_PERIODO }).pipe(delay(600));
  }

  /** Estado del inventario — datos reales de /api/bicicletas */
  reporteInventario(): Observable<ReporteInventarioResponse> {
    return this.http.get<BicicletaDtoResponse[]>(this.bicicletaUrl).pipe(
      map((bicicletas: BicicletaDtoResponse[]) => {
        const activas       = bicicletas.filter(b => b.activo);
        const stockTotal    = activas.reduce((acc, b) => acc + b.stock, 0);
        const valorTotal    = activas.reduce((acc, b) => acc + b.valorUnitario * b.stock, 0);
        const UMBRAL        = 5;
        const criticas      = activas.filter(b => b.stock < UMBRAL);

        return {
          totalBicicletas:          activas.length,
          stockTotal,
          valorTotalInventario:     valorTotal,
          totalStockCritico:        criticas.length,
          bicicletasEnStockCritico: criticas.map(b => ({
            idBicicleta:  b.id,
            codigo:       b.codigo,
            marca:        b.marca,
            modelo:       b.modelo,
            tipo:         b.tipo,
            stockActual:  b.stock,
            umbralMinimo: UMBRAL,
          })),
        } as ReporteInventarioResponse;
      })
    );
  }

  topBicicletas(fechaInicio: string, fechaFin: string, top = 10): Observable<ReporteBicicletasTopResponse> {
    return of({ ...MOCK_TOP_BICICLETAS }).pipe(delay(600));
  }

  movimientosInventario(fechaInicio: string, fechaFin: string): Observable<ReporteMovimientosResponse> {
    return of({ ...MOCK_MOVIMIENTOS }).pipe(delay(600));
  }
}
