import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-botao-padrao',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './botao-padrao.component.html',
  styleUrls: ['./botao-padrao.component.css']
})
export class BotaoPadraoComponent {
  // Define a cor do botão. Se você não passar nada, ele será primário (verde) por padrão.
  @Input() tipo: 'primario' | 'secundario' = 'primario';

  // Define se o botão está clicável ou não
  @Input() desabilitado: boolean = false;

  // A porta de saída que avisa a página mãe que o botão foi clicado
  @Output() acaoClique = new EventEmitter<Event>();

  aoClicar(event: Event) {
    // Só emite o clique se o botão não estiver desabilitado (segurança extra)
    if (!this.desabilitado) {
      this.acaoClique.emit(event);
    }
  }
}
