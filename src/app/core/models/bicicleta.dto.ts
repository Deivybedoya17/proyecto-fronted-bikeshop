// Espejo de BicicletaDtoResponse.java y BicicletaDtoRequest.java
// Enum Tipo.java

export type Tipo = 'CARRETERA' | 'MONTANA' | 'HIBRIDAS' | 'GRAVEL' | 'PLEGABLES' | 'ELETRICAS';

export interface BicicletaDtoResponse {
  id: string;           // UUID
  codigo: string;
  marca: string;
  modelo: string;
  tipo: Tipo;
  valorUnitario: number;
  stock: number;
  activo: boolean;
}

export interface BicicletaDtoRequest {
  codigo: string;
  marca: string;
  modelo: string;
  tipo: Tipo;
  valorUnitario: number;
  stock: number;
}

export interface BicicletaUpdateDto {
  marca?: string;
  modelo?: string;
  tipo?: Tipo;
  valorUnitario?: number;
  stock?: number;
  activo?: boolean;
}
