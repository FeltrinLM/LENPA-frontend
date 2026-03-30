import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, UsuarioLogado } from '../../core/services/auth/auth.service';

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

  usuario: UsuarioLogado | null = null;
  exibirModalSair: boolean = false;

  ngOnInit() {
    // 1. Verifica se está logado
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }

    // 2. Captura os dados decodificados
    this.usuario = this.authService.getDadosUsuario();

    // Debug extra para garantir que a variável foi populada no componente
    if (this.usuario) {
      console.log('Usuário carregado no componente:', this.usuario.nome);
    } else {
      console.warn('Falha ao popular objeto usuario. Verifique o console para erros de decodificação.');
    }
  }

  abrirModalSair() {
    this.exibirModalSair = true;
  }

  fecharModalSair() {
    this.exibirModalSair = false;
  }

  confirmarSair() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
