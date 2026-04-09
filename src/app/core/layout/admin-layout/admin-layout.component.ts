import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ReporteService } from '../../services/reporte.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly reporteSvc = inject(ReporteService);

  protected readonly notificacionesCount = signal(0);
  protected readonly showNotificaciones = signal(false);
  protected readonly detallesNotificaciones = signal<{icono: string, texto: string, tipo: string}[]>([]);

  ngOnInit(): void {
    const hoy = new Date().toISOString().split('T')[0];
    this.reporteSvc.obtenerResumen(hoy, hoy).subscribe({
      next: res => {
        let count = 0;
        const detalles = [];
        
        if (res.stockCritico > 0) {
          count += res.stockCritico;
          detalles.push({ icono: 'warning', texto: `Hay ${res.stockCritico} bicicleta(s) con stock crítico.`, tipo: 'alerta' });
        }
        if (res.totalVentas > 0) {
          count += res.totalVentas;
          detalles.push({ icono: 'point_of_sale', texto: `Se registraron ${res.totalVentas} ventas el día de hoy.`, tipo: 'normal' });
        }
        if (res.totalEntradas > 0) {
          count += res.totalEntradas;
          detalles.push({ icono: 'input', texto: `Se registraron ${res.totalEntradas} entradas a inventario hoy.`, tipo: 'normal' });
        }
        if (res.totalSalidas > 0) {
          count += res.totalSalidas;
          detalles.push({ icono: 'output', texto: `Se registraron ${res.totalSalidas} salidas o bajas hoy.`, tipo: 'normal' });
        }
        
        this.notificacionesCount.set(count);
        this.detallesNotificaciones.set(detalles);
      },
      error: () => {}
    });
  }

  toggleNotificaciones(): void {
    this.showNotificaciones.set(!this.showNotificaciones());
  }

  logout(): void {
    this.auth.logout();
  }
}
