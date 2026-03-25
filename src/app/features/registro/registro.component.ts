import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UsuarioService } from '../../core/services/usuario.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss'
})
export class RegistroComponent {
  private readonly fb      = inject(FormBuilder);
  private readonly svc     = inject(UsuarioService);
  private readonly router  = inject(Router);

  protected readonly loading     = signal(false);
  protected readonly error       = signal('');
  protected readonly showPass    = signal(false);

  // Campos que pide el backend: usuario, password, document, telefono
  protected readonly form = this.fb.nonNullable.group({
    usuario:  ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    document: ['', [Validators.required, Validators.minLength(5)]],
    telefono: [''],
  });

  // Accesos rápidos
  get usuario()  { return this.form.controls.usuario; }
  get password() { return this.form.controls.password; }
  get document() { return this.form.controls.document; }
  get telefono() { return this.form.controls.telefono; }

  togglePassword(): void {
    this.showPass.update(v => !v);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.svc.registrar(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/login']);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Error al crear usuario. Intenta de nuevo.');
      }
    });
  }
}
