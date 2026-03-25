// Espejo EXACTO de los DTOs de Java para Ventas

export interface DetalleVentaDtoRequest {
  idBicicleta: string;    // UUID
  cantidad: number;
  precioUnitario: number; // BigDecimal
}

export interface VentaDtoRequest {
  idUsuario: string;      // UUID
  fecha: string;          // ISO 8601 LocalDateTime
  detalles: DetalleVentaDtoRequest[];
}

export interface DetalleVentaDtoResponse {
  idDetalleVenta: string;   // UUID
  idBicicleta: string;      // UUID
  nombreBicicleta: string;
  marcaBicicleta: string;
  cantidad: number;
  precioUnitario: number;
  totalDetalle: number;
}

export interface VentaDtoResponse {
  idVenta: string;          // UUID
  idUsuario: string;        // UUID
  nombreUsuario: string;
  fecha: string;
  totalVenta: number;
  detalles: DetalleVentaDtoResponse[];
}
