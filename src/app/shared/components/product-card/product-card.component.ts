import { Component, inject, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { BicicletaDtoResponse } from '../../../core/models/bicicleta.dto';
import { CarritoService } from '../../../core/services/carrito.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  readonly bicicleta = input.required<BicicletaDtoResponse>();
  protected readonly carrito = inject(CarritoService);

  protected agregarAlCarrito(): void {
    this.carrito.agregar(this.bicicleta());
  }
}
