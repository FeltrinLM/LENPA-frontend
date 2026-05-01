import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';

// IMPORTANDO O SEU NOVO COMPONENTE DE ÍCONES
import { IconeComponent } from '../../shared/components/icone/icone.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  // ADICIONADO AQUI
  imports: [CommonModule, RouterLink, RouterLinkActive, IconeComponent],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  authService = inject(AuthService);

  // Helper para facilitar a leitura no HTML
  get ehAdmin(): boolean {
    return this.authService.getDadosUsuario()?.role === 'ADMINISTRADOR';
  }
}
