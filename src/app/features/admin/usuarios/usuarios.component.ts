import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../../../core/services/usuario.service';
import { UsuarioDtoResponse } from '../../../core/models/usuario.dto';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})
export class UsuariosComponent implements OnInit {
  private readonly svc        = inject(UsuarioService);
  private readonly fb         = inject(FormBuilder);
  
  protected readonly usuarios   = signal<UsuarioDtoResponse[]>([]);
  protected readonly loading    = signal(true);
  protected readonly saving     = signal(false);
  protected readonly showForm   = signal(false);
  protected readonly showPass   = signal(false);
  protected readonly registrarError = signal('');

  protected readonly form = this.fb.nonNullable.group({
    usuario:  ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    document: ['', [Validators.required, Validators.minLength(5), Validators.pattern(/^[0-9]+$/)]],
    telefono: ['', [Validators.pattern(/^[0-9+ ]+$/)]],
  });

  get formUsuario()  { return this.form.controls.usuario; }
  get formPassword() { return this.form.controls.password; }
  get formDocument() { return this.form.controls.document; }
  get formTelefono() { return this.form.controls.telefono; }

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.svc.listarTodos().subscribe({
      next: data => { this.usuarios.set(data); this.loading.set(false); },
      error: ()   => this.loading.set(false)
    });
  }

  abrirForm() {
    this.form.reset();
    this.registrarError.set('');
    this.showPass.set(false);
    this.showForm.set(true);
  }

  cerrarForm() {
    this.showForm.set(false);
  }

  togglePassword(): void {
    this.showPass.update(v => !v);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.registrarError.set('');

    this.svc.registrar(this.form.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.cerrarForm();
        this.load();
      },
      error: err => {
        this.saving.set(false);
        this.registrarError.set(err?.error?.message || 'Error al crear usuario. Intenta de nuevo.');
      }
    });
  }

  cambiarEstado(u: UsuarioDtoResponse): void {
    const op = u.activo ? this.svc.desactivar(u.idUsuario) : this.svc.activar(u.idUsuario);
    op.subscribe(updated =>
      this.usuarios.update(list => list.map(x => x.idUsuario === updated.idUsuario ? updated : x))
    );
  }

  eliminar(id: string): void {
    if (!confirm('¿Eliminar este usuario?')) return;
    this.svc.eliminar(id).subscribe(() =>
      this.usuarios.update(list => list.filter(u => u.idUsuario !== id))
    );
  }
}
