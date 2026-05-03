import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { AtividadeService } from '../../core/services/api/atividade.service';

// IMPORTANDO OS COMPONENTES
import { BotaoPadraoComponent } from '../../shared/components/botao-padrao/botao-padrao.component';
import { IconeComponent } from '../../shared/components/icone/icone.component';
import { CardAtividadeLayoutComponent } from '../../shared/components/card-atividade/card-atividade.component';
// IMPORTANDO O NOVO COMPONENTE DO POPUP
import { PopupAgendamentoComponent } from './popup-agendamento/popup-agendamento.component'; // Ajuste o caminho da pasta se necessário

@Component({
  selector: 'app-inicial',
  standalone: true,
  // ADICIONADO AQUI NO ARRAY DE IMPORTS
  imports: [
    CommonModule,
    FormsModule,
    BotaoPadraoComponent,
    IconeComponent,
    CardAtividadeLayoutComponent,
    PopupAgendamentoComponent
  ],
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

  atividades: any[] = [];

  // ==========================================
  // CONTROLE DO MODAL DE AGENDAMENTO
  // ==========================================
  exibirModalAgendamento: boolean = false;
  atividadeSelecionadaParaAgendamento: any = null;

  ngOnInit() {
    this.carregarAtividades();
  }

  carregarAtividades() {
    this.atividadeService.listar().subscribe({
      next: (res: any) => {
        this.atividades = res.content ? res.content : (Array.isArray(res) ? res : []);
        console.log('✅ Atividades recebidas do Java:', this.atividades);
        this.cdr.detectChanges();
      },
      error: (err: any) => {
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
      next: (response: any) => {
        this.carregando = false;
        this.fecharLogin();
        this.router.navigate(['/central-usuario']);
      },
      error: (err: any) => {
        this.carregando = false;
        if (err.status === 403) {
          this.mensagemErro = 'E-mail ou senha incorretos.';
        } else {
          this.mensagemErro = 'Erro ao conectar com o servidor.';
        }
      }
    });
  }

  // ==========================================
  // LÓGICA DO NOVO AGENDAMENTO AUTOMÁTICO
  // ==========================================

  abrirAgendamento(atividade: any) {
    this.atividadeSelecionadaParaAgendamento = atividade;
    this.exibirModalAgendamento = true;
  }

  fecharAgendamento() {
    this.exibirModalAgendamento = false;
    this.atividadeSelecionadaParaAgendamento = null;
  }
}
