import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

// Servicos
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
  styleUrl: './popup-agendamento.component.css',
})
export class PopupAgendamentoComponent implements OnInit {
  @Input() atividade: any = null;
  @Output() fechar = new EventEmitter<void>();
  @Output() sucesso = new EventEmitter<void>();

  private visitanteService = inject(VisitanteService);
  private agendarService = inject(AgendarService);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  carregandoAgendamento: boolean = false;
  mensagemSucessoAgendamento: string = '';
  mensagemErroFormulario: string = '';

  mostrarTelaEsgotado: boolean = false;

  emailAgendamento: string = '';
  nomeAgendamento: string = '';
  cidadeAgendamento: string = '';

  tipoAgendamento: 'INDIVIDUAL' | 'GRUPO' | 'INSTITUICAO' = 'INDIVIDUAL';
  quantidadeAgendamento: number | null = null;

  nomeInstituicao: string = '';
  nomeResponsavel: string = '';

  buscandoEmail: boolean = false;

  listaCidadesNoBanco: string[] = [];
  cidadesFiltradas: string[] = [];
  exibirDropdownCidades: boolean = false;
  cidadeVeioDoBanco: boolean = false;

  ngOnInit() {
    this.buscarCidadesIBGE();
  }

  aoMudarTipo() {
    this.nomeInstituicao = '';
    this.nomeResponsavel = '';
    this.cidadeAgendamento = '';
    this.exibirDropdownCidades = false;
    this.cidadeVeioDoBanco = false;

    if (this.tipoAgendamento !== 'INSTITUICAO') {
      this.buscarVisitantePorEmail();
    }
  }

  buscarCidadesIBGE() {
    const urlIbge = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados/RS/municipios';

    this.http.get<any[]>(urlIbge).subscribe({
      next: (dados) => {
        this.listaCidadesNoBanco = dados.map((cidade) => cidade.nome);
      },
      error: (err) => {
        console.error('Erro ao conectar com IBGE', err);
        this.listaCidadesNoBanco = ['Santa Maria', 'Itaara', 'Silveira Martins'];
      },
    });
  }

  private removerAcentos(texto: string): string {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  filtrarCidades() {
    this.cidadeVeioDoBanco = false;

    const termoOriginal = this.cidadeAgendamento.trim();
    const termo = this.removerAcentos(termoOriginal.toLowerCase());

    if (termo.length > 0) {
      this.cidadesFiltradas = this.listaCidadesNoBanco
        .filter((cidade) => {
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
    if (this.tipoAgendamento === 'INSTITUICAO') return true;
    if (this.cidadeVeioDoBanco) return true;
    return this.listaCidadesNoBanco.includes(this.cidadeAgendamento);
  }

  get isFormularioInvalido(): boolean {
    if (!this.emailAgendamento || !this.cidadeValida) return true;

    if (this.tipoAgendamento === 'INSTITUICAO') {
      if (!this.nomeInstituicao || !this.nomeResponsavel || !this.cidadeAgendamento) return true;
      if (!this.quantidadeAgendamento || this.quantidadeAgendamento < 2) return true;
    } else if (this.tipoAgendamento === 'GRUPO') {
      if (!this.nomeAgendamento || !this.cidadeAgendamento) return true;
      if (!this.quantidadeAgendamento || this.quantidadeAgendamento < 2) return true;
    } else {
      if (!this.nomeAgendamento || !this.cidadeAgendamento) return true;
    }

    return false;
  }

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
          if (this.tipoAgendamento !== 'INSTITUICAO') {
            this.nomeAgendamento = visitante.nome;
            this.cidadeAgendamento = visitante.cidade;
            this.cidadeVeioDoBanco = true;
            this.exibirDropdownCidades = false;
          }
        }
      },
      error: (err: any) => {
        this.buscandoEmail = false;
        this.cidadesFiltradas = [];
        this.exibirDropdownCidades = false;
        this.cidadeVeioDoBanco = false;
      },
    });
  }

  enviarPedidoAgendamento() {
    if (this.isFormularioInvalido) {
      this.mensagemErroFormulario =
        'Por favor, preencha todos os campos obrigatorios corretamente.';
      return;
    }

    this.carregandoAgendamento = true;
    this.mensagemErroFormulario = '';

    let nomeFinal = this.nomeAgendamento;
    if (this.tipoAgendamento === 'INSTITUICAO') {
      nomeFinal = `${this.nomeInstituicao.trim()} (Resp: ${this.nomeResponsavel.trim()})`;
    }

    const payload = {
      idAtividade: this.atividade.idAtividade,
      nomeVisitante: nomeFinal,
      emailVisitante: this.emailAgendamento,
      cidadeVisitante: this.cidadeAgendamento,
      quantidade: this.tipoAgendamento === 'INDIVIDUAL' ? 1 : this.quantidadeAgendamento || 2,
    };

    console.log('Disparando requisicao para o backend...', payload);

    this.agendarService.agendar(payload).subscribe({
      next: (response: any) => {
        this.carregandoAgendamento = false;
        this.mensagemSucessoAgendamento =
          'Reserva confirmada! Um e-mail com os detalhes foi enviado.';
        this.sucesso.emit();
        this.cdr.detectChanges();

        setTimeout(() => {
          this.fecharModal();
        }, 4000);
      },
      error: (err: any) => {
        this.carregandoAgendamento = false;
        this.mostrarTelaEsgotado = true;
        this.cdr.detectChanges();
      },
    });
  }
}
