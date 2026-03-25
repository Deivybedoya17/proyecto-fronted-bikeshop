import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  // ── eCommerce layout ──────────────────────────────────────────────────
  {
    path: '',
    loadComponent: () => import('./core/layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
      },
      {
        path: 'catalogo',
        loadComponent: () => import('./features/catalogo/catalogo.component').then(m => m.CatalogoComponent),
      },
      {
        path: 'carrito',
        loadComponent: () => import('./features/carrito/carrito.component').then(m => m.CarritoComponent),
      },
    ]
  },

  // ── Auth ──────────────────────────────────────────────────────────────
  {
    path: 'login',
    loadComponent: () => import('./features/auth/auth.component').then(m => m.AuthComponent),
  },
  {
    path: 'registro',
    loadComponent: () => import('./features/registro/registro.component').then(m => m.RegistroComponent),
  },

  // ── Admin Panel ───────────────────────────────────────────────────────
  {
    path: 'admin',
    loadComponent: () => import('./core/layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'inventario',
        loadComponent: () => import('./features/admin/inventario/inventario.component').then(m => m.InventarioComponent)
      },
      {
        path: 'ventas',
        loadComponent: () => import('./features/admin/ventas/ventas.component').then(m => m.VentasComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./features/admin/usuarios/usuarios.component').then(m => m.UsuariosComponent)
      },
      {
        path: 'entradas',
        loadComponent: () => import('./features/admin/entradas/entradas.component').then(m => m.EntradasComponent)
      },
      {
        path: 'salidas',
        loadComponent: () => import('./features/admin/salidas/salidas.component').then(m => m.SalidasComponent)
      },
      {
        path: 'proveedores',
        loadComponent: () => import('./features/admin/proveedores/proveedores.component').then(m => m.ProveedoresComponent)
      },
    ]
  },

  { path: '**', redirectTo: '' }
];
