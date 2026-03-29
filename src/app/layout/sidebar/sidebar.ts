import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; /* <--- ADICIONADO PARA O *ngIf */
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service'; /* <--- AJUSTE O CAMINHO SE NECESSÁRIO */

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive], /* <--- ADICIONADO AQUI */
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  // Tornamos o authService público para o HTML conseguir acessar
  authService = inject(AuthService);
}
