import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, SlicePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SalidaService } from '../../../core/services/salida.service';
import { BicicletaService } from '../../../core/services/bicicleta.service';
import { AuthService } from '../../../core/services/auth.service';
import { SalidaDtoResponse, SalidaBajaDtoRequest } from '../../../core/models/inventario.dto';
import { BicicletaDtoResponse } from '../../../core/models/bicicleta.dto';

@Component({
  selector: 'app-salidas',
  standalone: true,
  imports: [DatePipe, SlicePipe, ReactiveFormsModule],
  templateUrl: './salidas.component.html',
  styleUrl: './salidas.component.scss'
})
export class SalidasComponent implements OnInit {
  private readonly svc     = inject(SalidaService);
  private readonly biciSvc = inject(BicicletaService);
  private readonly authSvc = inject(AuthService);
  private readonly fb      = inject(FormBuilder);

  protected readonly items      = signal<SalidaDtoResponse[]>([]);
  protected readonly bicicletas = signal<BicicletaDtoResponse[]>([]);
  protected readonly loading    = signal(true);
  
  protected readonly showForm = signal(false);
  protected readonly saving   = signal(false);

  protected readonly form = this.fb.group({
    idBicicleta: ['', Validators.required],
    cantidad:    [1, [Validators.required, Validators.min(1)]],
    observacion: ['', Validators.required]
  });

  ngOnInit(): void {
    this.load();
    this.biciSvc.listarTodo().subscribe(bs => this.bicicletas.set(bs.filter(b => b.activo && b.stock > 0)));
  }

  private load(): void {
    this.loading.set(true);
    this.svc.listarTodas().subscribe({
      next: data => { this.items.set(data); this.loading.set(false); },
      error: ()   => this.loading.set(false)
    });
  }

  abrirForm() {
    this.form.reset({ cantidad: 1 });
    this.showForm.set(true);
  }

  cerrarForm() {
    this.showForm.set(false);
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const formVals = this.form.getRawValue();

    const payload: SalidaBajaDtoRequest = {
      idBicicleta: formVals.idBicicleta!,
      idUsuario: this.authSvc.userId()!,
      cantidad: Number(formVals.cantidad),
      observacion: formVals.observacion || undefined
    };

    // Assuming SalidaService has a "crear" method, if not, we use another endpoint 
    // The user provided the JSON for Dar de Baja, the endpoint should receive SalidaBajaDtoRequest
    this.svc.registrarBaja(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.load();
        // recargar las bicis para actualizar stock disponible
        this.biciSvc.listarTodo().subscribe(bs => this.bicicletas.set(bs.filter(b => b.activo && b.stock > 0)));
      },
      error: () => {
        this.saving.set(false);
        alert('Error al procesar la salida de inventario');
      }
    });
  }
}
