import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BicicletaService } from '../../core/services/bicicleta.service';
import { BicicletaDtoResponse, Tipo } from '../../core/models/bicicleta.dto';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

const TIPOS: Tipo[] = ['CARRETERA', 'MONTANA', 'HIBRIDAS', 'GRAVEL', 'PLEGABLES', 'ELETRICAS'];

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [FormsModule, ProductCardComponent],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.scss'
})
export class CatalogoComponent implements OnInit {
  private readonly svc   = inject(BicicletaService);
  private readonly route = inject(ActivatedRoute);

  protected readonly todas      = signal<BicicletaDtoResponse[]>([]);
  protected readonly loading    = signal(true);
  protected readonly busqueda   = signal('');
  protected readonly tipoActivo = signal<Tipo | ''>('');
  protected readonly tipos      = TIPOS;

  protected readonly filtradas = computed(() => {
    let items = this.todas().filter(b => b.activo);

    const tipo = this.tipoActivo();
    if (tipo) { items = items.filter(b => b.tipo === tipo); }

    const q = this.busqueda().toLowerCase().trim();
    if (q) {
      items = items.filter(b =>
        b.marca.toLowerCase().includes(q) ||
        b.modelo.toLowerCase().includes(q) ||
        b.codigo.toLowerCase().includes(q)
      );
    }

    return items;
  });

  ngOnInit(): void {
    // Leer query param ?tipo=MONTANA para pre-filtrar
    const tipoParam = this.route.snapshot.queryParamMap.get('tipo') as Tipo | null;
    if (tipoParam && TIPOS.includes(tipoParam)) {
      this.tipoActivo.set(tipoParam);
    }

    this.svc.listarTodo().subscribe({
      next: data => { this.todas.set(data); this.loading.set(false); },
      error: ()   => this.loading.set(false)
    });
  }

  filtrarPorTipo(tipo: Tipo | ''): void {
    this.tipoActivo.set(tipo);
  }

  actualizarBusqueda(valor: string): void {
    this.busqueda.set(valor);
  }

  formatTipo(t: string): string {
    return t === 'MONTANA' ? 'MONTAÑA' : t;
  }
}
