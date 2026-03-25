import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Tipo } from '../../../../core/models/bicicleta.dto';

interface Category {
  tipo: Tipo;
  label: string;
  icon: string;
  colorClass: string;
}

@Component({
  selector: 'app-categories-section',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './categories-section.component.html',
  styleUrl: './categories-section.component.scss'
})
export class CategoriesSectionComponent {
  protected readonly categories: Category[] = [
    { tipo: 'MONTANA', label: 'Montaña', icon: 'terrain', colorClass: 'green' },
    { tipo: 'CARRETERA', label: 'Carretera', icon: 'directions_bike', colorClass: 'blue' },
    { tipo: 'HIBRIDAS', label: 'Híbridas', icon: 'electric_bike', colorClass: 'purple' },
    { tipo: 'GRAVEL', label: 'Gravel', icon: 'landscape', colorClass: 'orange' },
    { tipo: 'PLEGABLES', label: 'Plegables', icon: 'pedal_bike', colorClass: 'teal' },
    { tipo: 'ELETRICAS', label: 'Eléctricas', icon: 'bolt', colorClass: 'yellow' },
  ];
}
