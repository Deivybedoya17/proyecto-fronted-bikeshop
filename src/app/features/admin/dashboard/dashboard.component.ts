import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { BicicletaService } from '../../../core/services/bicicleta.service';
import { VentaService } from '../../../core/services/venta.service';
import { BicicletaDtoResponse } from '../../../core/models/bicicleta.dto';
import { VentaDtoResponse } from '../../../core/models/venta.dto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private readonly bicicletaSvc = inject(BicicletaService);
  private readonly ventaSvc     = inject(VentaService);

  protected readonly bicicletas = signal<BicicletaDtoResponse[]>([]);
  protected readonly ventas     = signal<VentaDtoResponse[]>([]);
  protected readonly loading    = signal(true);

  protected get totalVentas() {
    return this.ventas().reduce((sum, v) => sum + (v.totalVenta ?? 0), 0);
  }
  protected get stockTotal() {
    return this.bicicletas().reduce((sum, b) => sum + b.stock, 0);
  }
  protected get lowStock() {
    return this.bicicletas().filter(b => b.stock <= 5).length;
  }

  ngOnInit(): void {
    this.bicicletaSvc.listarTodo().subscribe(data => { this.bicicletas.set(data); this.loading.set(false); });
    this.ventaSvc.listarTodo().subscribe(data => this.ventas.set(data));
  }
}
