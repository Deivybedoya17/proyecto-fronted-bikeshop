import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SalidaBajaDtoRequest, SalidaDtoResponse } from '../models/inventario.dto';

@Injectable({ providedIn: 'root' })
export class SalidaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/salidas`;

  registrarBaja(dto: SalidaBajaDtoRequest): Observable<SalidaDtoResponse> {
    return this.http.post<SalidaDtoResponse>(`${this.base}/baja`, dto);
  }

  listarTodas(): Observable<SalidaDtoResponse[]> {
    return this.http.get<SalidaDtoResponse[]>(this.base);
  }

  buscarPorId(id: string): Observable<SalidaDtoResponse> {
    return this.http.get<SalidaDtoResponse>(`${this.base}/${id}`);
  }

  listarPorVenta(idVenta: string): Observable<SalidaDtoResponse[]> {
    return this.http.get<SalidaDtoResponse[]>(`${this.base}/venta/${idVenta}`);
  }
}
