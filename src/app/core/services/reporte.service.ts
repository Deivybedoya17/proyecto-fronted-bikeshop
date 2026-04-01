import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
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
import { VentaDtoResponse } from '../models/venta.dto';


interface EntradaDtoResponse {
  idEntrada: string;
  codigoBicicleta: string;
  marcaBicicleta: string;
  cantidad: number;
  responsable: string;
  nombreUsuario: string;
  fecha: string;
}

interface SalidaDtoResponse {
  idSalida: string;
  codigoBicicleta: string;
  marcaBicicleta: string;
  cantidad: number;
  nombreUsuario: string;
  fecha: string;
  tipoSalida: string;
  observacion: string;
}

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reportes`;
  private readonly bicicletaUrl = `${environment.apiUrl}/bicicletas`;
  private readonly ventasUrl = `${environment.apiUrl}/ventas`;
  private readonly entradasUrl = `${environment.apiUrl}/entradas`;
  private readonly salidasUrl = `${environment.apiUrl}/salidas`;

  obtenerResumen(fechaInicio: string, fechaFin: string): Observable<ReporteResumenResponse> {
    return forkJoin({
      ventas: this.http.get<VentaDtoResponse[]>(this.ventasUrl),
      bicicletas: this.http.get<BicicletaDtoResponse[]>(this.bicicletaUrl),
      entradas: this.http.get<EntradaDtoResponse[]>(this.entradasUrl),
      salidas: this.http.get<SalidaDtoResponse[]>(this.salidasUrl)
    }).pipe(
      map(({ ventas, bicicletas, entradas, salidas }) => {

        const ventasPeriodo = ventas.filter(v => {
          if (!v.fecha) return false;
          const f = v.fecha.substring(0, 10);
          return f >= fechaInicio && f <= fechaFin;
        });

        const activas = bicicletas.filter(b => b.activo);
        const stockCritico = activas.filter(b => b.stock < 5).length;


        const totalVentas = ventasPeriodo.length;
        const totalIngresos = ventasPeriodo.reduce((acc, v) => acc + v.totalVenta, 0);
        let totalUnidadesVendidas = 0;


        const categoriasMap = new Map<string, { ingresos: number, unidades: number }>();

        ventasPeriodo.forEach(v => {
          v.detalles.forEach(d => {
            totalUnidadesVendidas += d.cantidad;

            const bici = bicicletas.find(b => b.id === d.idBicicleta);
            const tipo = bici ? bici.tipo : 'DESCONOCIDO';

            const actual = categoriasMap.get(tipo) || { ingresos: 0, unidades: 0 };
            actual.ingresos += d.totalDetalle;
            actual.unidades += d.cantidad;
            categoriasMap.set(tipo, actual);
          });
        });

        const ingresosPorTipo = Array.from(categoriasMap.entries()).map(([tipo, val]) => ({
          tipo,
          ingresos: val.ingresos,
          unidades: val.unidades
        })).sort((a, b) => b.ingresos - a.ingresos);

        // Entradas y Salidas
        const totalEntradas = entradas.filter(e => {
          if(!e.fecha) return false;
          const f = e.fecha.substring(0, 10);
          return f >= fechaInicio && f <= fechaFin;
        }).length;

        const totalSalidas = salidas.filter(s => {
          if(!s.fecha) return false;
          const f = s.fecha.substring(0, 10);
          return f >= fechaInicio && f <= fechaFin;
        }).length;

        return {
          periodoLabel: `${fechaInicio} / ${fechaFin}`,
          totalVentas,
          totalIngresos,
          totalUnidadesVendidas,
          totalEntradas,
          totalSalidas,
          bicicletasActivas: activas.length,
          stockCritico,
          ingresosPorTipo
        };
      })
    );
  }

  ventasPorPeriodo(req: ReporteVentasPorPeriodoRequest): Observable<ReporteVentasPorPeriodoResponse> {
    return this.http.get<VentaDtoResponse[]>(this.ventasUrl).pipe(
      map(ventas => {
        const validas = ventas.filter(v => {
          if (!v.fecha) return false;
          const f = v.fecha.substring(0, 10);
          return f >= req.fechaInicio && f <= req.fechaFin;
        });

        const totalIngresos = validas.reduce((acc, v) => acc + v.totalVenta, 0);


        const diasMap = new Map<string, { totalVentas: number, ingresos: number }>();
        validas.forEach(v => {
          const diaStr = v.fecha.substring(0, 10);
          const actual = diasMap.get(diaStr) || { totalVentas: 0, ingresos: 0 };
          actual.totalVentas++;
          actual.ingresos += v.totalVenta;
          diasMap.set(diaStr, actual);
        });

        const ventasPorDia = Array.from(diasMap.entries()).map(([f, d]) => ({
          fecha: f,
          totalVentas: d.totalVentas,
          ingresos: d.ingresos
        })).sort((a, b) => a.fecha.localeCompare(b.fecha));


        const diffAbs = new Date(req.fechaFin).getTime() - new Date(req.fechaInicio).getTime();
        const diffDias = Math.max(1, Math.ceil(diffAbs / 86400000) + 1);
        const promedioVentaDiaria = validas.length / diffDias;

        return {
          fechaInicio: req.fechaInicio,
          fechaFin: req.fechaFin,
          totalVentas: validas.length,
          totalIngresos,
          promedioVentaDiaria,
          ventasPorDia
        };
      })
    );
  }


  reporteInventario(): Observable<ReporteInventarioResponse> {
    return this.http.get<BicicletaDtoResponse[]>(this.bicicletaUrl).pipe(
      map((bicicletas: BicicletaDtoResponse[]) => {
        const activas = bicicletas.filter(b => b.activo);
        const stockTotal = activas.reduce((acc, b) => acc + b.stock, 0);
        const valorTotal = activas.reduce((acc, b) => acc + b.valorUnitario * b.stock, 0);
        const UMBRAL = 5;
        const criticas = activas.filter(b => b.stock < UMBRAL);

        return {
          totalBicicletas: activas.length,
          stockTotal,
          valorTotalInventario: valorTotal,
          totalStockCritico: criticas.length,
          bicicletasEnStockCritico: criticas.map(b => ({
            idBicicleta: b.id,
            codigo: b.codigo,
            marca: b.marca,
            modelo: b.modelo,
            tipo: b.tipo,
            stockActual: b.stock,
            umbralMinimo: UMBRAL,
          })),
        } as ReporteInventarioResponse;
      })
    );
  }

  topBicicletas(fechaInicio: string, fechaFin: string, top = 10): Observable<ReporteBicicletasTopResponse> {
    return forkJoin({
      ventas: this.http.get<VentaDtoResponse[]>(this.ventasUrl),
      bicicletas: this.http.get<BicicletaDtoResponse[]>(this.bicicletaUrl)
    }).pipe(
      map(({ ventas, bicicletas }) => {
        const validas = ventas.filter(v => {
          if (!v.fecha) return false;
          const f = v.fecha.substring(0, 10);
          return f >= fechaInicio && f <= fechaFin;
        });

        const biciStats = new Map<string, { unidades: number, ingresos: number }>();

        validas.forEach(v => {
          v.detalles.forEach(d => {
            const actual = biciStats.get(d.idBicicleta) || { unidades: 0, ingresos: 0 };
            actual.unidades += d.cantidad;
            actual.ingresos += d.totalDetalle;
            biciStats.set(d.idBicicleta, actual);
          });
        });

        const topRanking = Array.from(biciStats.entries())
          .map(([id, stats]) => {
            const b = bicicletas.find(b => b.id === id);
            return {
              idBicicleta: id,
              codigo: b?.codigo || 'DESC',
              marca: b?.marca || 'Desconocida',
              modelo: b?.modelo || 'Desconocido',
              tipo: b?.tipo || 'OTRO',
              unidadesVendidas: stats.unidades,
              ingresosGenerados: stats.ingresos
            };
          })
          .sort((a, b) => b.unidadesVendidas - a.unidadesVendidas)
          .slice(0, top);

        return {
          fechaInicio,
          fechaFin,
          top: topRanking
        };
      })
    );
  }

  movimientosInventario(fechaInicio: string, fechaFin: string): Observable<ReporteMovimientosResponse> {
    return forkJoin({
      entradas: this.http.get<EntradaDtoResponse[]>(this.entradasUrl),
      salidas: this.http.get<SalidaDtoResponse[]>(this.salidasUrl)
    }).pipe(
      map(({ entradas, salidas }) => {
        const entradasValidas = entradas.filter(e => {
          if (!e.fecha) return false;
          const f = e.fecha.substring(0, 10);
          return f >= fechaInicio && f <= fechaFin;
        });

        const salidasValidas = salidas.filter(s => {
          if (!s.fecha) return false;
          const f = s.fecha.substring(0, 10);
          return f >= fechaInicio && f <= fechaFin;
        });


        const movimientos = [
          ...entradasValidas.map(e => ({
            fecha: e.fecha,
            tipo: 'ENTRADA' as const,
            codigoBicicleta: e.codigoBicicleta,
            marcaBicicleta: e.marcaBicicleta,
            cantidad: e.cantidad,
            responsable: e.nombreUsuario,
            observacion: ''
          })),
          ...salidasValidas.map(s => ({
            fecha: s.fecha,
            tipo: 'SALIDA' as const,
            codigoBicicleta: s.codigoBicicleta,
            marcaBicicleta: s.marcaBicicleta,
            cantidad: s.cantidad,
            responsable: s.nombreUsuario,
            observacion: s.observacion || s.tipoSalida
          }))
        ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

        return {
          fechaInicio,
          fechaFin,
          totalEntradas: entradasValidas.length,
          totalSalidas: salidasValidas.length,
          movimientos
        };
      })
    );
  }


  exportarVentasPdf(fechaInicio: string, fechaFin: string): void {
    this.descargarArchivo(
      `${this.baseUrl}/ventas/export/pdf`,
      { fechaInicio, fechaFin },
      'reporte-ventas.pdf'
    );
  }

  exportarVentasExcel(fechaInicio: string, fechaFin: string): void {
    this.descargarArchivo(
      `${this.baseUrl}/ventas/export/excel`,
      { fechaInicio, fechaFin },
      'reporte-ventas.xlsx'
    );
  }

  exportarInventarioPdf(): void {
    this.descargarArchivo(
      `${this.baseUrl}/inventario/export/pdf`,
      {},
      'reporte-inventario.pdf'
    );
  }

  exportarInventarioExcel(): void {
    this.descargarArchivo(
      `${this.baseUrl}/inventario/export/excel`,
      {},
      'reporte-inventario.xlsx'
    );
  }

  exportarMovimientosPdf(fechaInicio: string, fechaFin: string): void {
    this.descargarArchivo(
      `${this.baseUrl}/movimientos/export/pdf`,
      { fechaInicio, fechaFin },
      'reporte-movimientos.pdf'
    );
  }

  exportarMovimientosExcel(fechaInicio: string, fechaFin: string): void {
    this.descargarArchivo(
      `${this.baseUrl}/movimientos/export/excel`,
      { fechaInicio, fechaFin },
      'reporte-movimientos.xlsx'
    );
  }


  private descargarArchivo(url: string, queryParams: Record<string, string>, filename: string): void {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(queryParams)) {
      params = params.set(key, value);
    }

    this.http.get(url, { params, responseType: 'blob' }).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(objectUrl);
      },
      error: (err) => {
        console.error(`Error descargando ${filename}:`, err);
        alert(`No se pudo descargar ${filename}. Verifica que el servidor esté corriendo.`);
      },
    });
  }
}
