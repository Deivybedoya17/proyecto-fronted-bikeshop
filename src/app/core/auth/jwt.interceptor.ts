import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const auth  = inject(AuthService);
  const token = auth.token();

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req).pipe(
    tap({
      error: (err) => {
        // Si el token expiró o es inválido, cerrar sesión y redirigir al login
        if (err.status === 401) {
          auth.logout();
        }
      }
    })
  );
};
