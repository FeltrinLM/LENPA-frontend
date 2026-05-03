import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http'; // <-- IMPORT DO HTTP

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
  quantidadeAgendamento: number = 1;

  buscandoEmail: boolean = false;

  // ==========================================
  // AUTOCOMPLETE COM API DO IBGE
  // ==========================================
  listaCidadesNoBanco: string[] = [];
  cidadesFiltradas: string[] = [];
  exibirDropdownCidades: boolean = false;

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

  // A MÁGICA DE VALIDAÇÃO ESTÁ AQUI:
  // Essa variável verifica em tempo real se o que está escrito no input existe na lista oficial do IBGE
  get cidadeValida(): boolean {
    return this.listaCidadesNoBanco.includes(this.cidadeAgendamento);
  }

  // ==========================================
  // LÓGICA DE AGENDAMENTO
  // ==========================================

  fecharModal() {
    this.fechar.emit();
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
        }
      },
      error: (err: any) => {
        this.buscandoEmail = false;
      }
    });
  }

  enviarPedidoAgendamento() {
    if (!this.nomeAgendamento || !this.emailAgendamento || !this.cidadeAgendamento) {
      this.mensagemErroAgendamento = 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }

    // TRAVA DE SEGURANÇA: Se o usuário burlou o HTML e forçou o clique, o TS barra.
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
      quantidade: this.tipoAgendamento === 'INDIVIDUAL' ? 1 : this.quantidadeAgendamento
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
