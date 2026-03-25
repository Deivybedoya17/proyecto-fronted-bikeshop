import { Component, inject, OnInit, signal } from '@angular/core';
import { BicicletaService } from '../../core/services/bicicleta.service';
import { BicicletaDtoResponse } from '../../core/models/bicicleta.dto';
import { HeroComponent } from './components/hero/hero.component';
import { CategoriesSectionComponent } from './components/categories-section/categories-section.component';
import { FeaturedProductsComponent } from './components/featured-products/featured-products.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroComponent,
    CategoriesSectionComponent,
    FeaturedProductsComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private readonly bicicletaService = inject(BicicletaService);

  protected readonly bicicletas = signal<BicicletaDtoResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.bicicletaService.listarTodo().subscribe({
      next: (data) => {
        this.bicicletas.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('No se pudieron cargar las bicicletas.');
        this.loading.set(false);
      }
    });
  }
}
