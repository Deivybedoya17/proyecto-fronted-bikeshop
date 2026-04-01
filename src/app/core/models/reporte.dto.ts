// =============================================
// Espejo de los DTOs del backend para Reportes
// =============================================

// ── Reporte de Ventas ──────────────────────────────────────────────────────
export interface ReporteVentasPorPeriodoRequest {
  fechaInicio: string; // ISO 8601
  fechaFin: string;    // ISO 8601
}

export interface ReporteVentasDiaDto {
  fecha: string;       // 'yyyy-MM-dd'
  totalVentas: number;
  ingresos: number;    // BigDecimal
}

export interface ReporteVentasPorPeriodoResponse {
  fechaInicio: string;
  fechaFin: string;
  totalVentas: number;
  totalIngresos: number;
  promedioVentaDiaria: number;
  ventasPorDia: ReporteVentasDiaDto[];
}

// ── Reporte de Inventario ──────────────────────────────────────────────────
export interface ReporteStockCriticoDto {
  idBicicleta: string;   // UUID
  codigo: string;
  marca: string;
  modelo: string;
  tipo: string;
  stockActual: number;
  umbralMinimo: number;
}

export interface ReporteInventarioResponse {
  totalBicicletas: number;
  stockTotal: number;
  valorTotalInventario: number;  // precio × stock de cada ítem
  bicicletasEnStockCritico: ReporteStockCriticoDto[];
  totalStockCritico: number;
}

// ── Reporte de Bicicletas más vendidas ────────────────────────────────────
export interface ReporteBicicletaTopDto {
  idBicicleta: string;   // UUID
  codigo: string;
  marca: string;
  modelo: string;
  tipo: string;
  unidadesVendidas: number;
  ingresosGenerados: number;
}

export interface ReporteBicicletasTopResponse {
  fechaInicio: string;
  fechaFin: string;
  top: ReporteBicicletaTopDto[];
}

// ── Reporte de Movimientos (Entradas + Salidas) ────────────────────────────
export interface ReporteMovimientoDto {
  fecha: string;
  tipo: 'ENTRADA' | 'SALIDA';
  codigoBicicleta: string;
  marcaBicicleta: string;
  cantidad: number;
  responsable: string;  // nombre del usuario
  observacion?: string;
}

export interface ReporteMovimientosResponse {
  fechaInicio: string;
  fechaFin: string;
  totalEntradas: number;
  totalSalidas: number;
  movimientos: ReporteMovimientoDto[];
}

// ── Reporte de Resumen General (KPIs del periodo) ─────────────────────────
export interface ReporteResumenResponse {
  periodoLabel: string;           // e.g. "Último mes"
  totalVentas: number;
  totalIngresos: number;
  totalUnidadesVendidas: number;
  totalEntradas: number;
  totalSalidas: number;
  bicicletasActivas: number;
  stockCritico: number;
  ingresosPorTipo: ReporteIngresosPorTipoDto[];
}

export interface ReporteIngresosPorTipoDto {
  tipo: string;          // CARRETERA, MONTANA, etc.
  ingresos: number;
  unidades: number;
}
