import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
// Ajuste o caminho da importação da Sidebar se o seu for diferente:
import { Sidebar } from './layout/sidebar/sidebar';
import { AuthService } from './core/services/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Sidebar, CommonModule],
  templateUrl: './app.html', /* CORRIGIDO PARA O SEU PADRÃO */
  styleUrl: './app.css'      /* CORRIGIDO PARA O SEU PADRÃO */
})
export class App {           /* CORRIGIDO DE VOLTA PARA 'App' */
  authService = inject(AuthService);
}
