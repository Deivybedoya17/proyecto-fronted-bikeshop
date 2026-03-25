import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UsuarioDtoRequest, UsuarioDtoResponse } from '../models/usuario.dto';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/usuarios`;

  registrar(dto: UsuarioDtoRequest): Observable<UsuarioDtoResponse> {
    return this.http.post<UsuarioDtoResponse>(`${this.base}/registro`, dto);
  }

  listarTodos(): Observable<UsuarioDtoResponse[]> {
    return this.http.get<UsuarioDtoResponse[]>(this.base);
  }

  buscarPorId(id: string): Observable<UsuarioDtoResponse> {
    return this.http.get<UsuarioDtoResponse>(`${this.base}/${id}`);
  }

  actualizar(id: string, dto: UsuarioDtoRequest): Observable<UsuarioDtoResponse> {
    return this.http.put<UsuarioDtoResponse>(`${this.base}/${id}`, dto);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  activar(id: string): Observable<UsuarioDtoResponse> {
    return this.http.patch<UsuarioDtoResponse>(`${this.base}/${id}/activar`, {});
  }

  desactivar(id: string): Observable<UsuarioDtoResponse> {
    return this.http.patch<UsuarioDtoResponse>(`${this.base}/${id}/desactivar`, {});
  }
}
