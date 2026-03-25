import { Component, input } from '@angular/core';
import { BicicletaDtoResponse } from '../../../../core/models/bicicleta.dto';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-featured-products',
  standalone: true,
  imports: [ProductCardComponent],
  templateUrl: './featured-products.component.html',
  styleUrl: './featured-products.component.scss'
})
export class FeaturedProductsComponent {
  readonly bicicletas = input<BicicletaDtoResponse[]>([]);
  readonly loading    = input<boolean>(false);
  readonly error      = input<string | null>(null);
}
