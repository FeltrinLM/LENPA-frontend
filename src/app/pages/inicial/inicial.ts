import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { AtividadeService } from '../../core/services/api/atividade.service';
import { VisitanteService } from '../../core/services/api/visitante.service';
import { AgendarService } from '../../core/services/api/agendar.service';

// IMPORTANDO OS COMPONENTES
import { BotaoPadraoComponent } from '../../shared/components/botao-padrao/botao-padrao.component';
import { IconeComponent } from '../../shared/components/icone/icone.component';
import { CardAtividadeLayoutComponent } from '../../shared/components/card-atividade/card-atividade.component'; // <-- NOVO IMPORT AQUI

@Component({
  selector: 'app-inicial',
  standalone: true,
  // ADICIONADO AQUI NO ARRAY DE IMPORTS
  imports: [CommonModule, FormsModule, BotaoPadraoComponent, IconeComponent, CardAtividadeLayoutComponent],
  templateUrl: './inicial.html',
  styleUrl: './inicial.css',
})
export class Inicial implements OnInit {
  exibirLogin: boolean = false;

  authService = inject(AuthService);
  private router = inject(Router);
  private atividadeService = inject(AtividadeService);
  private visitanteService = inject(VisitanteService);
  private agendarService = inject(AgendarService);
  private cdr = inject(ChangeDetectorRef);

  email = '';
  senha = '';
  mensagemErro = '';
  carregando = false;

  atividades: any[] = [];

  // ==========================================
  // MODAL DE AGENDAMENTO SELF-SERVICE (NOVO FLUXO)
  // ==========================================
  exibirModalAgendamento: boolean = false;
  atividadeSelecionadaParaAgendamento: any = null;
  carregandoAgendamento: boolean = false;
  mensagemSucessoAgendamento: string = '';
  mensagemErroAgendamento: string = '';

  // Campos do Formulário
  emailAgendamento: string = '';
  nomeAgendamento: string = '';
  cidadeAgendamento: string = '';
  tipoAgendamento: 'INDIVIDUAL' | 'GRUPO' = 'INDIVIDUAL';
  quantidadeAgendamento: number = 1;

  // Controle visual para quando estiver buscando o e-mail no banco
  buscandoEmail: boolean = false;

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

    this.emailAgendamento = '';
    this.nomeAgendamento = '';
    this.cidadeAgendamento = '';
    this.tipoAgendamento = 'INDIVIDUAL';
    this.quantidadeAgendamento = 1;

    this.mensagemSucessoAgendamento = '';
    this.mensagemErroAgendamento = '';
  }

  fecharAgendamento() {
    this.exibirModalAgendamento = false;
    this.atividadeSelecionadaParaAgendamento = null;
  }

  buscarVisitantePorEmail() {
    if (!this.emailAgendamento || !this.emailAgendamento.includes('@')) return;

    this.buscandoEmail = true;

    this.visitanteService.buscarPorEmail(this.emailAgendamento).subscribe({
      next: (visitante: any) => {
        this.buscandoEmail = false;
        if (visitante) {
          this.nomeAgendamento = visitante.nome;
          this.cidadeAgendamento = visitante.cidade;
          console.log('Visitante reconhecido e campos preenchidos!');
        }
      },
      error: (err: any) => {
        this.buscandoEmail = false;
        console.log('Novo visitante. Precisará preencher os dados.');
      }
    });
  }

  enviarPedidoAgendamento() {
    if (!this.nomeAgendamento || !this.emailAgendamento || !this.cidadeAgendamento) {
      this.mensagemErroAgendamento = 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }

    this.carregandoAgendamento = true;
    this.mensagemErroAgendamento = '';

    const payload = {
      idAtividade: this.atividadeSelecionadaParaAgendamento.idAtividade,
      nomeVisitante: this.nomeAgendamento,
      emailVisitante: this.emailAgendamento,
      cidadeVisitante: this.cidadeAgendamento,
      quantidade: this.tipoAgendamento === 'INDIVIDUAL' ? 1 : this.quantidadeAgendamento
    };

    this.agendarService.agendar(payload).subscribe({
      next: (response: any) => {
        this.carregandoAgendamento = false;
        this.mensagemSucessoAgendamento = 'Reserva confirmada! Um e-mail com os detalhes foi enviado.';

        this.carregarAtividades();

        setTimeout(() => {
          this.fecharAgendamento();
        }, 4000);
      },
      error: (err: any) => {
        this.carregandoAgendamento = false;
        this.mensagemErroAgendamento = err.error?.message || 'Ocorreu um erro ao tentar agendar. Tente novamente.';
      }
    });
  }
}
