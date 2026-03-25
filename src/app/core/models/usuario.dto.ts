// Espejo EXACTO de los DTOs de Java

// ── Usuario ──────────────────────────────────────────────
export interface UsuarioDtoResponse {
  idUsuario: string;      // UUID
  userName: string;
  document: string;
  telefono: string;
  rolNombre: string;
  activo: boolean;
}

export interface UsuarioDtoRequest {
  usuario: string;         // campo "usuario" en el backend
  password: string;
  document: string;
  telefono: string;
}

// ── Auth ─────────────────────────────────────────────────
/** Espejo de LoginRequest.java */
export interface LoginRequest {
  userName: string;
  password: string;
}

/** Espejo de LoginResponseDTO.java */
export interface LoginResponse {
  token: string;
  username: string;
  role: string;
  userId: string;          // UUID
}
