import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EntradaDtoRequest, EntradaDtoResponse } from '../models/inventario.dto';

@Injectable({ providedIn: 'root' })
export class EntradaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/entradas`;

  registrar(dto: EntradaDtoRequest): Observable<EntradaDtoResponse[]> {
    return this.http.post<EntradaDtoResponse[]>(this.base, dto);
  }

  listarTodas(): Observable<EntradaDtoResponse[]> {
    return this.http.get<EntradaDtoResponse[]>(this.base);
  }

  buscarPorId(id: string): Observable<EntradaDtoResponse> {
    return this.http.get<EntradaDtoResponse>(`${this.base}/${id}`);
  }

  listarPorProveedor(idProveedor: string): Observable<EntradaDtoResponse[]> {
    return this.http.get<EntradaDtoResponse[]>(`${this.base}/proveedor/${idProveedor}`);
  }
}
