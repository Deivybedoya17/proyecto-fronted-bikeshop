import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarritoService } from '../../core/services/carrito.service';
import { VentaService } from '../../core/services/venta.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.scss'
})
export class CarritoComponent {
  protected readonly carrito  = inject(CarritoService);
  private  readonly ventaSvc  = inject(VentaService);
  private  readonly auth      = inject(AuthService);

  protected readonly loading  = signal(false);
  protected readonly success  = signal(false);
  protected readonly error    = signal<string | null>(null);

  protected checkout(): void {
    if (!this.auth.isLoggedIn()) { this.error.set('Debes iniciar sesión para comprar.'); return; }
    if (this.carrito.items().length === 0) return;

    this.loading.set(true);
    this.error.set(null);

    const payload = {
      idUsuario: this.auth.userId()!,
      fecha: new Date().toISOString(),
      detalles: this.carrito.toDetalles()
    };

    this.ventaSvc.crear(payload).subscribe({
      next: () => {
        this.success.set(true);
        this.carrito.vaciar();
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al procesar la compra. Inténtalo de nuevo.');
        this.loading.set(false);
      }
    });
  }
}
