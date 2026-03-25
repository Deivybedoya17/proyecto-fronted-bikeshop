import { Injectable, signal, computed } from '@angular/core';
import { BicicletaDtoResponse } from '../models/bicicleta.dto';
import { DetalleVentaDtoRequest } from '../models/venta.dto';

export interface CartItem {
  bicicleta: BicicletaDtoResponse;
  cantidad: number;
}

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private readonly _items = signal<CartItem[]>([]);

  readonly items = this._items.asReadonly();

  readonly total = computed(() =>
    this._items().reduce((sum, item) => sum + item.bicicleta.valorUnitario * item.cantidad, 0)
  );

  readonly count = computed(() =>
    this._items().reduce((sum, item) => sum + item.cantidad, 0)
  );

  agregar(bicicleta: BicicletaDtoResponse): void {
    this._items.update(items => {
      const existing = items.find(i => i.bicicleta.id === bicicleta.id);
      if (existing) {
        return items.map(i =>
          i.bicicleta.id === bicicleta.id ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }
      return [...items, { bicicleta, cantidad: 1 }];
    });
  }

  remover(bicicletaId: string): void {
    this._items.update(items => items.filter(i => i.bicicleta.id !== bicicletaId));
  }

  actualizarCantidad(bicicletaId: string, cantidad: number): void {
    if (cantidad <= 0) {
      this.remover(bicicletaId);
      return;
    }
    this._items.update(items =>
      items.map(i => i.bicicleta.id === bicicletaId ? { ...i, cantidad } : i)
    );
  }

  vaciar(): void {
    this._items.set([]);
  }

  /** Prepara el payload para enviar al backend (VentaDtoRequest) */
  toDetalles(): DetalleVentaDtoRequest[] {
    return this._items().map(item => ({
      idBicicleta: item.bicicleta.id,
      cantidad: item.cantidad,
      precioUnitario: item.bicicleta.valorUnitario
    }));
  }
}
