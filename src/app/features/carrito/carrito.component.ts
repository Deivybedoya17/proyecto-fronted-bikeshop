import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CarritoService } from '../../core/services/carrito.service';
import { VentaService } from '../../core/services/venta.service';
import { AuthService } from '../../core/services/auth.service';
import { ReporteService } from '../../core/services/reporte.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, FormsModule],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.scss'
})
export class CarritoComponent {
  protected readonly carrito  = inject(CarritoService);
  private  readonly ventaSvc  = inject(VentaService);
  private  readonly auth      = inject(AuthService);
  private  readonly reporteSvc= inject(ReporteService);

  protected readonly loading  = signal(false);
  protected readonly success  = signal(false);
  protected readonly error    = signal<string | null>(null);
  protected readonly emailCliente = signal('');
  protected readonly mensajeExito = signal('');

  emailValido(): boolean {
    const email = this.emailCliente().trim();
    if (!email) return true; // vacío es válido (es opcional)
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  protected checkout(): void {
    if (!this.auth.isLoggedIn()) { this.error.set('Debes iniciar sesión para comprar.'); return; }
    if (this.carrito.items().length === 0) return;
    if (!this.emailValido()) { this.error.set('Ingresa un correo válido o déjalo vacío.'); return; }

    this.loading.set(true);
    this.error.set(null);

    const emailTrimmed = this.emailCliente().trim() || null;

    const payload = {
      idUsuario: this.auth.userId()!,
      fecha: new Date().toISOString(),
      detalles: this.carrito.toDetalles(),
      emailCliente: emailTrimmed
    };

    this.ventaSvc.crear(payload).subscribe({
      next: (ventaCreada) => {
        this.carrito.vaciar();
        this.loading.set(false);

        // Mensaje de éxito diferenciado
        if (emailTrimmed) {
          this.mensajeExito.set(`Tu pedido ha sido procesado y la factura fue enviada a ${emailTrimmed}`);
        } else {
          this.mensajeExito.set('Tu pedido ha sido procesado. Gracias por comprar en BikeShop.');
        }
        this.success.set(true);

        // Generar factura automática (descarga local)
        if (ventaCreada && ventaCreada.idVenta) {
          this.reporteSvc.exportarFacturaPdf(ventaCreada.idVenta);
        }
      },
      error: () => {
        this.error.set('Error al procesar la compra. Inténtalo de nuevo.');
        this.loading.set(false);
      }
    });
  }
}
