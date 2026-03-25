import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/usuario.dto';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);

  // Guardamos los datos planos del LoginResponseDTO del backend
  private readonly _token    = signal<string | null>(null);
  private readonly _username = signal<string | null>(null);
  private readonly _role     = signal<string | null>(null);
  private readonly _userId   = signal<string | null>(null);

  readonly token      = this._token.asReadonly();
  readonly username   = this._username.asReadonly();
  readonly role       = this._role.asReadonly();
  readonly userId     = this._userId.asReadonly();
  readonly isLoggedIn = () => !!this._token();

  constructor() {
    // Restaurar sesión de localStorage
    const stored   = localStorage.getItem('bs_token');
    const username = localStorage.getItem('bs_username');
    const role     = localStorage.getItem('bs_role');
    const userId   = localStorage.getItem('bs_userId');
    if (stored) {
      this._token.set(stored);
      this._username.set(username);
      this._role.set(role);
      this._userId.set(userId);
    }
  }

  login(credentials: LoginRequest) {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(res => {
          this._token.set(res.token);
          this._username.set(res.username);
          this._role.set(res.role);
          this._userId.set(res.userId);
          localStorage.setItem('bs_token', res.token);
          localStorage.setItem('bs_username', res.username);
          localStorage.setItem('bs_role', res.role);
          localStorage.setItem('bs_userId', res.userId);
        })
      );
  }

  logout(): void {
    this._token.set(null);
    this._username.set(null);
    this._role.set(null);
    this._userId.set(null);
    localStorage.removeItem('bs_token');
    localStorage.removeItem('bs_username');
    localStorage.removeItem('bs_role');
    localStorage.removeItem('bs_userId');
    this.router.navigate(['/login']);
  }

  isAdmin(): boolean {
    return this._role() === 'ADMIN';
  }
}
