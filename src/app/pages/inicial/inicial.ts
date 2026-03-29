import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // OBRIGATÓRIO para ler os inputs do form
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-inicial',
  standalone: true,
  imports: [CommonModule, FormsModule], // <-- Adicionado o FormsModule aqui
  templateUrl: './inicial.html',
  styleUrl: './inicial.css',
})
export class Inicial {
  exibirLogin: boolean = false;

  // Injeções
  private authService = inject(AuthService);
  private router = inject(Router);

  // Variáveis do formulário
  email = '';
  senha = '';
  mensagemErro = '';
  carregando = false;

  abrirLogin() {
    this.exibirLogin = true;
  }

  fecharLogin() {
    this.exibirLogin = false;
    this.mensagemErro = ''; // Limpa a mensagem de erro ao fechar o modal
  }

  fazerLogin() {
    this.mensagemErro = '';
    this.carregando = true;

    this.authService.login({ email: this.email, senha: this.senha }).subscribe({
      next: (response) => {
        this.carregando = false;
        this.fecharLogin();
        // Redireciona para a central após o login
        this.router.navigate(['/central-usuario']);
      },
      error: (err) => {
        this.carregando = false;
        if (err.status === 403) {
          this.mensagemErro = 'E-mail ou senha incorretos.';
        } else {
          this.mensagemErro = 'Erro ao conectar com o servidor.';
        }
      }
    });
  }
}
