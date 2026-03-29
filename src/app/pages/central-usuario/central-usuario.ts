import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-central-usuario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './central-usuario.html',
  styleUrl: './central-usuario.css',
})
export class CentralUsuario implements OnInit {

  private authService = inject(AuthService);
  private router = inject(Router);

  emailUsuario: string | null = '';

  ngOnInit() {
    // 1. Verifica se tem token. Se não tem, expulsa pra tela inicial.
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }

    // 2. Prova real: Extrai o e-mail direto da assinatura do Token JWT
    this.emailUsuario = this.authService.getUsuarioLogado();
  }

  sair() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
