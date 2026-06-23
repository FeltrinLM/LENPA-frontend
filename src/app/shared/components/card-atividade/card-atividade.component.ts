import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-atividade-layout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-atividade.component.html',
  styleUrl: './card-atividade.component.css',
})
export class CardAtividadeLayoutComponent {
  // Define a "cara" do card
  @Input() modo: 'vertical' | 'horizontal' = 'vertical';

  @Input() imagemRaw: string | null | undefined = null;
  @Input() titulo: string = '';

  get urlImagem(): string {
    let url = '';

    if (!this.imagemRaw) {
      url = '/assets/images/placeholder_background.jpg';
    } else if (this.imagemRaw.startsWith('http')) {
      url = this.imagemRaw;
    } else {
      url = `http://localhost:8080/uploads/${this.imagemRaw}`;
    }

    // 🔥 O SEGREDO AQUI: O encodeURI trata caracteres especiais e espaços vazios no nome do arquivo
    return encodeURI(url);
  }
}
