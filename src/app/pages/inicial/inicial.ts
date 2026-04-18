import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { AtividadeService } from '../../core/services/api/atividade.service';

@Component({
  selector: 'app-inicial',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inicial.html',
  styleUrl: './inicial.css',
})
export class Inicial implements OnInit {
  exibirLogin: boolean = false;

  authService = inject(AuthService);
  private router = inject(Router);
  private atividadeService = inject(AtividadeService);
  private cdr = inject(ChangeDetectorRef);

  email = '';
  senha = '';
  mensagemErro = '';
  carregando = false;

  // Variável para guardar as atividades que vierem do Java
  atividades: any[] = [];

  ngOnInit() {
    this.carregarAtividades();
  }

  carregarAtividades() {
    this.atividadeService.listar().subscribe({
      next: (res) => {
        // Blindagem: Aceita tanto a paginação do Spring (res.content) quanto uma lista direta (Array)
        this.atividades = res.content ? res.content : (Array.isArray(res) ? res : []);

        console.log('✅ Atividades recebidas do Java:', this.atividades); // DEBUG

        // Força o HTML a se desenhar novamente agora que os dados chegaram
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Erro ao conectar com a API de atividades:', err);
      }
    });
  }

  abrirLogin() {
    this.exibirLogin = true;
  }

  fecharLogin() {
    this.exibirLogin = false;
    this.mensagemErro = '';
  }

  fazerLogin() {
    this.mensagemErro = '';
    this.carregando = true;

    this.authService.login({ email: this.email, senha: this.senha }).subscribe({
      next: (response) => {
        this.carregando = false;
        this.fecharLogin();
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
