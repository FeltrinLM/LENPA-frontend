import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

// Serviços
import { VisitanteService } from '../../../core/services/api/visitante.service';
import { AgendarService } from '../../../core/services/api/agendar.service';

// Componentes
import { BotaoPadraoComponent } from '../../../shared/components/botao-padrao/botao-padrao.component';
import { IconeComponent } from '../../../shared/components/icone/icone.component';

@Component({
  selector: 'app-popup-agendamento',
  standalone: true,
  imports: [CommonModule, FormsModule, BotaoPadraoComponent, IconeComponent],
  templateUrl: './popup-agendamento.component.html',
  styleUrl: './popup-agendamento.component.css'
})
export class PopupAgendamentoComponent implements OnInit {
  @Input() atividade: any = null;
  @Output() fechar = new EventEmitter<void>();
  @Output() sucesso = new EventEmitter<void>();

  private visitanteService = inject(VisitanteService);
  private agendarService = inject(AgendarService);
  private http = inject(HttpClient);

  carregandoAgendamento: boolean = false;
  mensagemSucessoAgendamento: string = '';
  mensagemErroAgendamento: string = '';

  emailAgendamento: string = '';
  nomeAgendamento: string = '';
  cidadeAgendamento: string = '';
  tipoAgendamento: 'INDIVIDUAL' | 'GRUPO' = 'INDIVIDUAL';

  // SOLUÇÃO 2: Agora começa como null, permitindo que o placeholder apareça no HTML!
  quantidadeAgendamento: number | null = null;

  buscandoEmail: boolean = false;

  // ==========================================
  // AUTOCOMPLETE COM API DO IBGE
  // ==========================================
  listaCidadesNoBanco: string[] = [];
  cidadesFiltradas: string[] = [];
  exibirDropdownCidades: boolean = false;

  // SOLUÇÃO 1: A chave do nosso "Passe Livre"
  cidadeVeioDoBanco: boolean = false;

  ngOnInit() {
    this.buscarCidadesIBGE();
  }

  buscarCidadesIBGE() {
    const urlIbge = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados/RS/municipios';

    this.http.get<any[]>(urlIbge).subscribe({
      next: (dados) => {
        this.listaCidadesNoBanco = dados.map(cidade => cidade.nome);
      },
      error: (err) => {
        console.error('Erro ao conectar com IBGE', err);
        this.listaCidadesNoBanco = ['Santa Maria', 'Itaara', 'Silveira Martins'];
      }
    });
  }

  private removerAcentos(texto: string): string {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  filtrarCidades() {
    // Se o usuário digitou qualquer coisa, ele perde o passe livre e precisa escolher da lista
    this.cidadeVeioDoBanco = false;

    const termoOriginal = this.cidadeAgendamento.trim();
    const termo = this.removerAcentos(termoOriginal.toLowerCase());

    if (termo.length > 0) {
      this.cidadesFiltradas = this.listaCidadesNoBanco
        .filter(cidade => {
          const cidadeNormalizada = this.removerAcentos(cidade.toLowerCase());
          return cidadeNormalizada.startsWith(termo);
        })
        .sort((a, b) => a.localeCompare(b));

      this.exibirDropdownCidades = true;
    } else {
      this.exibirDropdownCidades = false;
    }
  }

  selecionarCidade(cidadeEscolhida: string) {
    this.cidadeAgendamento = cidadeEscolhida;
    this.exibirDropdownCidades = false;
  }

  get cidadeValida(): boolean {
    // A MÁGICA AQUI: Se a cidade veio preenchida do banco pelo e-mail, ela é válida automaticamente!
    if (this.cidadeVeioDoBanco) return true;

    // Se não, passa pela verificação normal do IBGE
    return this.listaCidadesNoBanco.includes(this.cidadeAgendamento);
  }

  // ==========================================
  // LÓGICA DE AGENDAMENTO
  // ==========================================

  fecharModal() {
    this.fechar.emit();
  }

  buscarVisitantePorEmail() {
    const emailLimpo = this.emailAgendamento.trim();
    this.emailAgendamento = emailLimpo;

    if (!emailLimpo || !emailLimpo.includes('@')) return;

    this.buscandoEmail = true;

    this.visitanteService.buscarPorEmail(emailLimpo).subscribe({
      next: (visitante: any) => {
        this.buscandoEmail = false;

        if (visitante && visitante.nome) {
          this.nomeAgendamento = visitante.nome;
          this.cidadeAgendamento = visitante.cidade;

          // Habilita o "Passe Livre" e garante que o menu de cidades fique escondido
          this.cidadeVeioDoBanco = true;
          this.exibirDropdownCidades = false;
        }
      },
      error: (err: any) => {
        this.buscandoEmail = false;
        this.nomeAgendamento = '';
        this.cidadeAgendamento = '';
        this.cidadesFiltradas = [];
        this.exibirDropdownCidades = false;
        this.cidadeVeioDoBanco = false; // Sem visitante = sem passe livre
      }
    });
  }

  enviarPedidoAgendamento() {
    if (!this.nomeAgendamento || !this.emailAgendamento || !this.cidadeAgendamento) {
      this.mensagemErroAgendamento = 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }

    if (!this.cidadeValida) {
      this.mensagemErroAgendamento = 'Por favor, selecione uma cidade válida clicando nas opções da lista.';
      return;
    }

    this.carregandoAgendamento = true;
    this.mensagemErroAgendamento = '';

    const payload = {
      idAtividade: this.atividade.idAtividade,
      nomeVisitante: this.nomeAgendamento,
      emailVisitante: this.emailAgendamento,
      cidadeVisitante: this.cidadeAgendamento,
      // Fallback de segurança: Se vier null, manda 2 pro Java.
      quantidade: this.tipoAgendamento === 'INDIVIDUAL' ? 1 : (this.quantidadeAgendamento || 2)
    };

    this.agendarService.agendar(payload).subscribe({
      next: (response: any) => {
        this.carregandoAgendamento = false;
        this.mensagemSucessoAgendamento = 'Reserva confirmada! Um e-mail com os detalhes foi enviado.';
        this.sucesso.emit();

        setTimeout(() => {
          this.fecharModal();
        }, 4000);
      },
      error: (err: any) => {
        this.carregandoAgendamento = false;
        this.mensagemErroAgendamento = err.error?.message || 'Ocorreu um erro ao tentar agendar. Tente novamente.';
      }
    });
  }
}
