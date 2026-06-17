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
  salvandoCadastro: boolean = false; // Trava para o botão não permitir duplo clique

  formCadastro = {
    eventoSelecionado: '',
    acao: 'agendar',
    tipoVisitante: 'individual',
    visitante: { nome: '', cidade: '' },
    instituicao: { nome: '', quantidade: null as number | null, local: '' },
    responsavel: { nome: '' },
    anonimo: { descricao: 'Público Geral', quantidade: null as number | null },
  };

  visitantesFiltrados: any[] = [];
  exibirDropdownNomes: boolean = false;

  listaCidadesNoBanco: string[] = [];
  cidadesFiltradas: string[] = [];
  exibirDropdownCidades: boolean = false;
  cidadeConfirmada: boolean = false;

  get isCidadeValida(): boolean {
    if (
      this.formCadastro.tipoVisitante === 'individual' ||
      this.formCadastro.tipoVisitante === 'instituicao'
    ) {
      return this.cidadeConfirmada;
    }
    return true;
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
    let termoOriginal = '';

    if (this.formCadastro.tipoVisitante === 'individual') {
      termoOriginal = (this.formCadastro.visitante.cidade || '').trim();
    } else if (this.formCadastro.tipoVisitante === 'instituicao') {
      termoOriginal = (this.formCadastro.instituicao.local || '').trim();
    }

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
    if (this.formCadastro.tipoVisitante === 'individual') {
      this.formCadastro.visitante.cidade = cidadeEscolhida;
    } else if (this.formCadastro.tipoVisitante === 'instituicao') {
      this.formCadastro.instituicao.local = cidadeEscolhida;
    }

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
    this.formCadastro.responsavel = { nome: '' };
    this.formCadastro.anonimo = { descricao: 'Público Geral', quantidade: null };
  }

  salvarCadastro() {
    if (!this.formCadastro.eventoSelecionado) {
      alert('Por favor, selecione uma atividade.');
      return;
    }

    if (
      (this.formCadastro.tipoVisitante === 'individual' ||
        this.formCadastro.tipoVisitante === 'instituicao') &&
      !this.isCidadeValida
    ) {
      alert('Por favor, selecione uma cidade válida clicando em uma das opções da lista.');
      return;
    }

    this.salvandoCadastro = true;

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
      cidadeFinal = this.formCadastro.instituicao.local;
      quantidadeFinal = this.formCadastro.instituicao.quantidade || 2;
    } else if (this.formCadastro.tipoVisitante === 'anonimo') {
      nomeFinal = this.formCadastro.anonimo.descricao || 'Público Geral';
      cidadeFinal = 'Não informada';
      quantidadeFinal = this.formCadastro.anonimo.quantidade || 1;

      if (quantidadeFinal < 1) {
        alert('Por favor, insira uma quantidade válida de pessoas.');
        this.salvandoCadastro = false;
        return;
      }
    }

    if (!nomeFinal || !cidadeFinal) {
      alert('Preencha os campos obrigatórios.');
      this.salvandoCadastro = false;
      return;
    }

    const idAtividadeSelecionada = Number(this.formCadastro.eventoSelecionado);
    const acaoDesejada = this.formCadastro.acao;

    // Função interna que executa o fluxo final de comunicação com o backend
    const executarAgendamentoFinal = (
      payloadFinal: any,
      idAntigoParaCancelar: number | null = null,
    ) => {
      const recarregarTabelaSeNecessario = () => {
        if (this.eventoSelecionadoParaGerenciar) {
          const idGerenciado =
            this.eventoSelecionadoParaGerenciar.idAtividade ||
            this.eventoSelecionadoParaGerenciar.id;
          if (idGerenciado === idAtividadeSelecionada) {
            this.carregarListaAgendamentos(idGerenciado);
          }
        }
      };

      const concluirRequisicao = () => {
        this.agendarService.agendar(payloadFinal).subscribe({
          next: (res: any) => {
            if (acaoDesejada === 'confirmar') {
              const idGerado = res?.idAgendamento || res?.id;
              if (idGerado) {
                this.agendarService.confirmarPresenca(idGerado).subscribe({
                  next: () => {
                    alert('Registro atualizado e presença confirmada!');
                    recarregarTabelaSeNecessario();
                    this.limparFormulario();
                    this.salvandoCadastro = false;
                  },
                  error: () => {
                    alert('Visitante registrado, mas houve falha ao dar check-in.');
                    recarregarTabelaSeNecessario();
                    this.limparFormulario();
                    this.salvandoCadastro = false;
                  },
                });
              } else {
                this.salvandoCadastro = false;
              }
            } else {
              alert('Registro atualizado com sucesso!');
              recarregarTabelaSeNecessario();
              this.limparFormulario();
              this.salvandoCadastro = false;
            }
          },
          error: (err: any) => {
            alert('Erro: ' + (err.error?.message || err.error || 'Falha no agendamento.'));
            this.salvandoCadastro = false;
          },
        });
      };

      // Se houver um ID antigo para cancelar (por causa da soma), exclui antes de recriar
      if (idAntigoParaCancelar) {
        this.agendarService.cancelar(idAntigoParaCancelar).subscribe({
          next: () => concluirRequisicao(),
          error: () => {
            alert('Falha ao atualizar o grupo anônimo existente no sistema.');
            this.salvandoCadastro = false;
          },
        });
      } else {
        concluirRequisicao();
      }
    };

    // LOGICA DE SOMA EXCLUSIVA PARA O GRUPO ANÔNIMO
    if (this.formCadastro.tipoVisitante === 'anonimo') {
      this.agendarService.listar().subscribe({
        next: (res: any) => {
          const todos = res.content || (Array.isArray(res) ? res : []);

          // Busca se já existe o exato mesmo nome no mesmo evento que NÃO esteja cancelado
          const agendamentoExistente = todos.find(
            (a: any) =>
              a.idAtividade === idAtividadeSelecionada &&
              a.nomeVisitante.toLowerCase() === nomeFinal.toLowerCase() &&
              a.agendamento !== false,
          );

          let payload = {
            idAtividade: idAtividadeSelecionada,
            nomeVisitante: nomeFinal,
            emailVisitante: null,
            cidadeVisitante: cidadeFinal,
            quantidade: quantidadeFinal,
          };

          if (agendamentoExistente) {
            // Soma a quantidade do novo form com a quantidade que já estava no banco
            payload.quantidade = quantidadeFinal + (agendamentoExistente.quantidade || 1);
            const idAntigo = agendamentoExistente.idAgendamento || agendamentoExistente.id;

            executarAgendamentoFinal(payload, idAntigo);
          } else {
            executarAgendamentoFinal(payload, null);
          }
        },
        error: () => {
          alert('Erro ao buscar lista para verificação de grupos existentes.');
          this.salvandoCadastro = false;
        },
      });
    } else {
      // Fluxo normal para individuais e instituições (não soma)
      const payload = {
        idAtividade: idAtividadeSelecionada,
        nomeVisitante: nomeFinal,
        emailVisitante: null,
        cidadeVisitante: cidadeFinal,
        quantidade: quantidadeFinal,
      };

      executarAgendamentoFinal(payload, null);
    }
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
