import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BicicletaDtoResponse, BicicletaDtoRequest, BicicletaUpdateDto } from '../models/bicicleta.dto';

@Injectable({ providedIn: 'root' })
export class BicicletaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/bicicletas`;

  listarTodo(): Observable<BicicletaDtoResponse[]> {
    return this.http.get<BicicletaDtoResponse[]>(this.baseUrl);
  }

  obtenerPorId(id: string): Observable<BicicletaDtoResponse> {
    return this.http.get<BicicletaDtoResponse>(`${this.baseUrl}/${id}`);
  }

  crear(dto: BicicletaDtoRequest): Observable<BicicletaDtoResponse> {
    return this.http.post<BicicletaDtoResponse>(this.baseUrl, dto);
  }

  actualizar(id: string, dto: BicicletaUpdateDto): Observable<BicicletaDtoResponse> {
    return this.http.put<BicicletaDtoResponse>(`${this.baseUrl}/${id}`, dto);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  activar(id: string): Observable<BicicletaDtoResponse> {
    return this.http.put<BicicletaDtoResponse>(`${this.baseUrl}/${id}/activar`, {});
  }

  desactivar(id: string): Observable<BicicletaDtoResponse> {
    return this.http.put<BicicletaDtoResponse>(`${this.baseUrl}/${id}/desactivar`, {});
  }
}
