import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProveedorDtoRequest, ProveedorDtoResponse } from '../models/inventario.dto';

@Injectable({ providedIn: 'root' })
export class ProveedorService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/proveedores`;

  crear(dto: ProveedorDtoRequest): Observable<ProveedorDtoResponse> {
    return this.http.post<ProveedorDtoResponse>(this.base, dto);
  }

  listarTodos(): Observable<ProveedorDtoResponse[]> {
    return this.http.get<ProveedorDtoResponse[]>(this.base);
  }

  buscarPorId(id: string): Observable<ProveedorDtoResponse> {
    return this.http.get<ProveedorDtoResponse>(`${this.base}/${id}`);
  }

  actualizar(id: string, dto: ProveedorDtoRequest): Observable<ProveedorDtoResponse> {
    return this.http.put<ProveedorDtoResponse>(`${this.base}/${id}`, dto);
  }

  activar(id: string): Observable<ProveedorDtoResponse> {
    return this.http.patch<ProveedorDtoResponse>(`${this.base}/${id}/activar`, {});
  }

  desactivar(id: string): Observable<ProveedorDtoResponse> {
    return this.http.patch<ProveedorDtoResponse>(`${this.base}/${id}/desactivar`, {});
  }
}
