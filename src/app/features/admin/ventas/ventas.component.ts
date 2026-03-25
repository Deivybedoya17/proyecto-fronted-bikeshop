import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, SlicePipe } from '@angular/common';
import { VentaService } from '../../../core/services/venta.service';
import { VentaDtoResponse } from '../../../core/models/venta.dto';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, SlicePipe],
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.scss'
})
export class VentasComponent implements OnInit {
  private readonly svc     = inject(VentaService);
  protected readonly ventas = signal<VentaDtoResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly expandido = signal<string | null>(null);

  ngOnInit(): void {
    this.svc.listarTodo().subscribe({
      next: data => { this.ventas.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  toggleExpandido(idVenta: string): void {
    this.expandido.update(current => current === idVenta ? null : idVenta);
  }
}
