import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-botao-flutuante',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './botao-flutuante.component.html',
  styleUrls: ['./botao-flutuante.component.css']
})
export class BotaoFlutuanteComponent {
  // O texto dinâmico que o botão vai exibir ao passar o mouse
  @Input() textoBase: string = 'Ação';

  // O evento que avisa a página que o botão foi clicado
  @Output() acaoClique = new EventEmitter<void>();

  aoClicar() {
    this.acaoClique.emit();
  }
}
