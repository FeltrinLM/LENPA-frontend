import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icone',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icone.component.html',
  styleUrls: ['./icone.component.css']
})
export class IconeComponent {
  // O nome do ícone que você quer chamar (ex: 'lixeira', 'salvar', 'lapis')
  @Input() nome: string = '';

}
