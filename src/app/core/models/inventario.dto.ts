// ------------------------------------------------
// Espejo EXACTO de EntradaDtoResponse.java / EntradaDtoRequest.java
// ------------------------------------------------

export interface EntradaItemDto {
  idBicicleta: string;    // UUID
  cantidad: number;
}

export interface EntradaDtoRequest {
  idProveedor: string;    // UUID
  idUsuario: string;      // UUID
  items: EntradaItemDto[];
}

export interface EntradaDtoResponse {
  idEntrada: string;          // UUID
  idBicicleta: string;
  codigoBicicleta: string;
  marcaBicicleta: string;
  idProveedor: string;
  nombreProveedor: string;
  idUsuario: string;
  nombreUsuario: string;
  cantidad: number;
  fecha: string;              // LocalDateTime → ISO string
}

// ------------------------------------------------
// Espejo EXACTO de SalidaDtoResponse.java / SalidaBajaDtoRequest.java
// ------------------------------------------------

export interface SalidaDtoResponse {
  idSalida: string;           // UUID
  idBicicleta: string;
  codigoBicicleta: string;
  marcaBicicleta: string;
  idUsuario: string;
  nombreUsuario: string;
  idVenta: string;
  tipoSalida: string;
  cantidad: number;
  observacion: string;
  fecha: string;
}

export interface SalidaBajaDtoRequest {
  idBicicleta: string;
  idUsuario: string;
  cantidad: number;
  observacion?: string;
}

// ------------------------------------------------
// Espejo EXACTO de ProveedorDtoResponse.java / ProveedorDtoRequest.java
// ------------------------------------------------

export interface ProveedorDtoResponse {
  idProveedor: string;       // UUID
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  activo: boolean;
  totalEntradas: number;
}

export interface ProveedorDtoRequest {
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
}
