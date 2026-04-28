import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { AtividadeService } from '../../core/services/api/atividade.service';
// IMPORTANTE: Você vai precisar importar os serviços do Visitante e do Agendamento!
import { VisitanteService } from '../../core/services/api/visitante.service';
import { AgendarService } from '../../core/services/api/agendar.service';

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
  // Injetando os novos serviços
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

    // Limpa o formulário sempre que abrir o modal
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

  // Função disparada quando o usuário tira o mouse/foco do campo de e-mail (blur)
  buscarVisitantePorEmail() {
    if (!this.emailAgendamento || !this.emailAgendamento.includes('@')) return;

    this.buscandoEmail = true;

    this.visitanteService.buscarPorEmail(this.emailAgendamento).subscribe({
      next: (visitante: any) => {
        this.buscandoEmail = false;
        // Se achou, preenche magicamente os campos na tela!
        if (visitante) {
          this.nomeAgendamento = visitante.nome;
          this.cidadeAgendamento = visitante.cidade;
          console.log('Visitante reconhecido e campos preenchidos!');
        }
      },
      error: (err: any) => {
        this.buscandoEmail = false;
        // Erro 404 significa apenas que o visitante é novo, então não fazemos nada e deixamos ele digitar
        console.log('Novo visitante. Precisará preencher os dados.');
      }
    });
  }

  enviarPedidoAgendamento() {
    // Validação básica do Front-end
    if (!this.nomeAgendamento || !this.emailAgendamento || !this.cidadeAgendamento) {
      this.mensagemErroAgendamento = 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }

    this.carregandoAgendamento = true;
    this.mensagemErroAgendamento = '';

    // Montando o DTO que o Java (DadosCadastroAgendamento) está esperando
    const payload = {
      idAtividade: this.atividadeSelecionadaParaAgendamento.idAtividade,
      nomeVisitante: this.nomeAgendamento,
      emailVisitante: this.emailAgendamento,
      cidadeVisitante: this.cidadeAgendamento,
      // Se for individual, manda 1. Se for grupo, manda o que o cara digitou.
      quantidade: this.tipoAgendamento === 'INDIVIDUAL' ? 1 : this.quantidadeAgendamento
    };

    // Chamando a API real de Agendamento
    this.agendarService.agendar(payload).subscribe({
      next: (response: any) => {
        this.carregandoAgendamento = false;
        this.mensagemSucessoAgendamento = 'Reserva confirmada! Um e-mail com os detalhes foi enviado.';

        // Recarrega as atividades por trás para atualizar as vagas restantes na tela inicial
        this.carregarAtividades();

        setTimeout(() => {
          this.fecharAgendamento();
        }, 4000);
      },
      error: (err: any) => {
        this.carregandoAgendamento = false;
        // Captura aquela mensagem de "Capacidade máxima excedida" que fizemos no Java
        this.mensagemErroAgendamento = err.error?.message || 'Ocorreu um erro ao tentar agendar. Tente novamente.';
      }
    });
  }
}
