import { Component, OnInit, inject, signal } from '@angular/core';
import { UsuarioService } from '../../../core/services/usuario.service';
import { UsuarioDtoResponse } from '../../../core/models/usuario.dto';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})
export class UsuariosComponent implements OnInit {
  private readonly svc        = inject(UsuarioService);
  protected readonly usuarios = signal<UsuarioDtoResponse[]>([]);
  protected readonly loading  = signal(true);

  ngOnInit(): void {
    this.svc.listarTodos().subscribe({
      next: data => { this.usuarios.set(data); this.loading.set(false); },
      error: ()   => this.loading.set(false)
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
