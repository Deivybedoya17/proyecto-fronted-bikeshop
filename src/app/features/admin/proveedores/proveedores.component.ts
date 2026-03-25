import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProveedorService } from '../../../core/services/proveedor.service';
import { ProveedorDtoResponse } from '../../../core/models/inventario.dto';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './proveedores.component.html',
  styleUrl: './proveedores.component.scss'
})
export class ProveedoresComponent implements OnInit {
  private readonly svc = inject(ProveedorService);
  private readonly fb  = inject(FormBuilder);

  protected readonly proveedores = signal<ProveedorDtoResponse[]>([]);
  protected readonly loading     = signal(true);
  protected readonly saving      = signal(false);
  protected readonly showForm    = signal(false);
  protected readonly editId      = signal<string | null>(null);

  protected readonly form = this.fb.group({
    nombre:   ['', [Validators.required, Validators.maxLength(100)]],
    contacto: ['', Validators.maxLength(100)],
    telefono: ['', Validators.maxLength(20)],
    email:    ['', [Validators.email, Validators.maxLength(100)]],
  });

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.svc.listarTodos().subscribe({
      next: data => { this.proveedores.set(data); this.loading.set(false); },
      error: ()   => this.loading.set(false)
    });
  }

  abrirFormNuevo(): void {
    this.editId.set(null);
    this.form.reset();
    this.showForm.set(true);
  }

  editar(p: ProveedorDtoResponse): void {
    this.editId.set(p.idProveedor);
    this.form.patchValue({
      nombre: p.nombre,
      contacto: p.contacto,
      telefono: p.telefono,
      email: p.email
    });
    this.showForm.set(true);
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const dto: any = { ...this.form.getRawValue() };
    const id = this.editId();
    const op$ = id ? this.svc.actualizar(id, dto) : this.svc.crear(dto);
    op$.subscribe({
      next: () => { this.saving.set(false); this.showForm.set(false); this.load(); },
      error: ()  => this.saving.set(false)
    });
  }

  cancelar(): void {
    this.showForm.set(false);
  }

  toggleEstado(p: ProveedorDtoResponse): void {
    const op = p.activo ? this.svc.desactivar(p.idProveedor) : this.svc.activar(p.idProveedor);
    op.subscribe(updated =>
      this.proveedores.update(list => list.map(x => x.idProveedor === updated.idProveedor ? updated : x))
    );
  }
}
