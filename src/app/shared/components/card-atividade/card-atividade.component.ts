import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-atividade-layout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-atividade.component.html',
  styleUrl: './card-atividade.component.css'
})
export class CardAtividadeLayoutComponent {
  // Define a "cara" do card
  @Input() modo: 'vertical' | 'horizontal' = 'vertical';

  @Input() imagemRaw: string | null | undefined = null;
  @Input() titulo: string = '';

  get urlImagem(): string {
    if (!this.imagemRaw) {
      return '/assets/images/placeholder_background.jpg';
    }
    if (this.imagemRaw.startsWith('http')) {
      return this.imagemRaw;
    }
    return `http://localhost:8080/uploads/${this.imagemRaw}`;
  }
}
