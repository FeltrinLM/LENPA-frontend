import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { AtividadeService } from '../../core/services/api/atividade.service';
import { VisitanteService } from '../../core/services/api/visitante.service';
import { AgendarService } from '../../core/services/api/agendar.service';

// IMPORTANDO OS COMPONENTES
import { BotaoPadraoComponent } from '../../shared/components/botao-padrao/botao-padrao.component';
import { IconeComponent } from '../../shared/components/icone/icone.component';
import { CardAtividadeLayoutComponent } from '../../shared/components/card-atividade/card-atividade.component';

@Component({
  selector: 'app-gerenciamento-atividade',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BotaoPadraoComponent,
    IconeComponent,
    CardAtividadeLayoutComponent,
  ],
  templateUrl: './gerenciamento-atividade.html',
  styleUrls: ['./gerenciamento-atividade.css', './gerenciamento-agendameto-presenca.css'],
})
export class GerenciamentoAtividade implements OnInit {
  private atividadeService = inject(AtividadeService);
  private visitanteService = inject(VisitanteService);
  private agendarService = inject(AgendarService);
  private cdr = inject(ChangeDetectorRef);
  private http = inject(HttpClient);

  eventosDisponiveis: any[] = [];
  pessoasCadastradas: any[] = [];

  eventoSelecionadoParaGerenciar: any = null;
  listaAgendamentos: any[] = [];
  carregandoLista: boolean = false;

  formCadastro = {
    eventoSelecionado: '',
    acao: 'agendar',
    tipoVisitante: 'individual',
    visitante: { nome: '', cidade: '' },
    instituicao: { nome: '', quantidade: null as number | null, local: '' },
    responsavel: { nome: '', cidade: '' },
    anonimo: { descricao: 'Público Geral', quantidade: null as number | null },
  };

  visitantesFiltrados: any[] = [];
  exibirDropdownNomes: boolean = false;

  listaCidadesNoBanco: string[] = [];
  cidadesFiltradas: string[] = [];
  exibirDropdownCidades: boolean = false;
  cidadeConfirmada: boolean = false;

  get isCidadeIndividualValida(): boolean {
    if (this.formCadastro.tipoVisitante !== 'individual') return true;
    return this.cidadeConfirmada;
  }

  ngOnInit() {
    this.carregarDadosIniciais();
    this.buscarCidadesIBGE();
  }

  carregarDadosIniciais() {
    this.atividadeService.listar().subscribe({
      next: (res: any) => {
        this.eventosDisponiveis = res.content ? res.content : Array.isArray(res) ? res : [];
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Erro ao carregar atividades', err),
    });

    this.visitanteService.listar().subscribe({
      next: (res: any) => {
        this.pessoasCadastradas = res.content ? res.content : Array.isArray(res) ? res : [];
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Erro ao carregar visitantes', err),
    });
  }

  private removerAcentos(texto: string): string {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  filtrarNomes() {
    const termoOriginal = this.formCadastro.visitante.nome.trim();
    const termo = this.removerAcentos(termoOriginal.toLowerCase());

    if (termo.length > 0) {
      this.visitantesFiltrados = this.pessoasCadastradas
        .filter((v) => {
          if (!v.nome) return false;
          const nomeNormalizado = this.removerAcentos(v.nome.toLowerCase());
          return nomeNormalizado.includes(termo);
        })
        .sort((a, b) => a.nome.localeCompare(b.nome));

      this.exibirDropdownNomes = true;
    } else {
      this.exibirDropdownNomes = false;
      this.formCadastro.visitante.cidade = '';
    }
  }

  selecionarNome(visitante: any) {
    this.formCadastro.visitante.nome = visitante.nome;
    this.formCadastro.visitante.cidade = visitante.cidade;
    if (visitante.cidade) {
      this.cidadeConfirmada = true;
    }
    this.exibirDropdownNomes = false;
  }

  esconderDropdownNomes() {
    setTimeout(() => {
      this.exibirDropdownNomes = false;
      this.buscarCidadePorNome();
    }, 200);
  }

  buscarCidadePorNome() {
    const nomeLimpo = (this.formCadastro.visitante.nome || '').trim();
    if (!nomeLimpo) return;

    const visitanteConhecido = this.pessoasCadastradas.find(
      (v) => v.nome && v.nome.toLowerCase() === nomeLimpo.toLowerCase(),
    );

    if (visitanteConhecido && !this.formCadastro.visitante.cidade) {
      this.formCadastro.visitante.cidade = visitanteConhecido.cidade;
      this.cidadeConfirmada = true;
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

  filtrarCidades() {
    this.cidadeConfirmada = false;

    const termoOriginal = (this.formCadastro.visitante.cidade || '').trim();
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
    this.formCadastro.visitante.cidade = cidadeEscolhida;
    this.cidadeConfirmada = true;
    this.exibirDropdownCidades = false;
  }

  esconderDropdownCidades() {
    setTimeout(() => {
      this.exibirDropdownCidades = false;
    }, 200);
  }

  private limparFormulario() {
    this.formCadastro.visitante = { nome: '', cidade: '' };
    this.cidadeConfirmada = false;
    this.formCadastro.instituicao = { nome: '', quantidade: null, local: '' };
    this.formCadastro.responsavel = { nome: '', cidade: '' };
    this.formCadastro.anonimo = { descricao: 'Público Geral', quantidade: null };
  }

  salvarCadastro() {
    if (!this.formCadastro.eventoSelecionado) {
      alert('Por favor, selecione uma atividade.');
      return;
    }

    if (this.formCadastro.tipoVisitante === 'individual' && !this.isCidadeIndividualValida) {
      alert('Por favor, selecione a cidade do visitante clicando em uma das opções da lista.');
      return;
    }

    let nomeFinal = '';
    let cidadeFinal = '';
    let quantidadeFinal = 1;

    if (this.formCadastro.tipoVisitante === 'individual') {
      nomeFinal = this.formCadastro.visitante.nome;
      cidadeFinal = this.formCadastro.visitante.cidade;
    } else if (this.formCadastro.tipoVisitante === 'instituicao') {
      nomeFinal = this.formCadastro.instituicao.nome;
      if (this.formCadastro.responsavel.nome) {
        nomeFinal += ' (Resp: ' + this.formCadastro.responsavel.nome + ')';
      }
      cidadeFinal = this.formCadastro.instituicao.local || this.formCadastro.responsavel.cidade;
      quantidadeFinal = this.formCadastro.instituicao.quantidade || 2;
    } else if (this.formCadastro.tipoVisitante === 'anonimo') {
      nomeFinal = this.formCadastro.anonimo.descricao || 'Público Geral';
      cidadeFinal = 'Não informada';
      quantidadeFinal = this.formCadastro.anonimo.quantidade || 1;

      if (quantidadeFinal < 1) {
        alert('Por favor, insira uma quantidade válida de pessoas.');
        return;
      }
    }

    if (!nomeFinal || !cidadeFinal) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    const payload = {
      idAtividade: this.formCadastro.eventoSelecionado,
      nomeVisitante: nomeFinal,
      emailVisitante: null,
      cidadeVisitante: cidadeFinal,
      quantidade: quantidadeFinal,
    };

    const acaoDesejada = this.formCadastro.acao;

    this.agendarService.agendar(payload).subscribe({
      next: (res: any) => {
        if (acaoDesejada === 'confirmar') {
          const idGerado = res?.idAgendamento || res?.id;

          if (idGerado) {
            this.agendarService.confirmarPresenca(idGerado).subscribe({
              next: () => {
                alert('Presença confirmada com sucesso!');
                this.limparFormulario();
              },
              error: () => {
                alert('O visitante foi agendado, mas houve uma falha ao confirmar a presença.');
                this.limparFormulario();
              },
            });
          }
        } else {
          alert('Agendamento registrado!');
          this.limparFormulario();
        }
      },
      error: (err: any) =>
        alert('Erro: ' + (err.error?.message || err.error || 'Falha no agendamento.')),
    });
  }

  abrirGerenciamentoAtividade(evento: any) {
    this.eventoSelecionadoParaGerenciar = evento;
    this.carregarListaAgendamentos(evento.idAtividade || evento.id);
  }

  fecharGerenciamento() {
    this.eventoSelecionadoParaGerenciar = null;
    this.listaAgendamentos = [];
  }

  carregarListaAgendamentos(idAtividade: number) {
    this.carregandoLista = true;
    this.agendarService.listar().subscribe({
      next: (res: any) => {
        const todosAgendamentos = res.content ? res.content : Array.isArray(res) ? res : [];

        this.listaAgendamentos = todosAgendamentos
          .filter((a: any) => a.idAtividade === idAtividade)
          .map((a: any) => {
            return {
              ...a,
              cidadeDisplay: a.cidadeVisitante || a.cidade || 'Não informada',
              presencaConfirmada:
                a.presenca === true || a.presencaConfirmada === true || a.status === 'CONFIRMADO',
            };
          });

        this.carregandoLista = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erro ao buscar lista', err);
        this.carregandoLista = false;
      },
    });
  }

  fazerCheckIn(agendamento: any) {
    if (agendamento.presencaConfirmada) return;

    const id = agendamento.idAgendamento || agendamento.id;
    this.agendarService.confirmarPresenca(id).subscribe({
      next: () => {
        agendamento.presencaConfirmada = true;
        this.cdr.detectChanges();
      },
      error: () => alert('Erro ao confirmar presença.'),
    });
  }

  cancelarAgendamento(agendamento: any) {
    if (confirm(`Tem certeza que deseja cancelar a vaga de ${agendamento.nomeVisitante}?`)) {
      const id = agendamento.idAgendamento || agendamento.id;
      this.agendarService.cancelar(id).subscribe({
        next: () => {
          // Extraí a variável para remover a quebra de linha maluca que deu erro de compilação
          const idAtiv =
            this.eventoSelecionadoParaGerenciar.idAtividade ||
            this.eventoSelecionadoParaGerenciar.id;
          this.carregarListaAgendamentos(idAtiv);
        },
        error: () => alert('Erro ao cancelar agendamento.'),
      });
    }
  }
}
