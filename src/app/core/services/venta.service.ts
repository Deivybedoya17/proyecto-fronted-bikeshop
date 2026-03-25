import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VentaDtoRequest, VentaDtoResponse } from '../models/venta.dto';

@Injectable({ providedIn: 'root' })
export class VentaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/ventas`;

  listarTodo(): Observable<VentaDtoResponse[]> {
    return this.http.get<VentaDtoResponse[]>(this.baseUrl);
  }

  obtenerPorId(id: string): Observable<VentaDtoResponse> {
    return this.http.get<VentaDtoResponse>(`${this.baseUrl}/${id}`);
  }

  crear(dto: VentaDtoRequest): Observable<VentaDtoResponse> {
    return this.http.post<VentaDtoResponse>(this.baseUrl, dto);
  }
}
