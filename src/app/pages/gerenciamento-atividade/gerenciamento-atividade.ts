import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  imports: [CommonModule, FormsModule, BotaoPadraoComponent, IconeComponent, CardAtividadeLayoutComponent],
  templateUrl: './gerenciamento-atividade.html',
  styleUrls: [
    './gerenciamento-atividade.css',
    './gerenciamento-agendameto-presenca.css'
  ]
})
export class GerenciamentoAtividade implements OnInit {

  private atividadeService = inject(AtividadeService);
  private visitanteService = inject(VisitanteService);
  private agendarService = inject(AgendarService);
  private cdr = inject(ChangeDetectorRef);

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
    responsavel: { nome: '', cidade: '' }
  };

  // ==========================================
  // VARIÁVEIS DO AUTOCOMPLETE DE NOMES
  // ==========================================
  visitantesFiltrados: any[] = [];
  exibirDropdownNomes: boolean = false;

  ngOnInit() {
    this.carregarDadosIniciais();
  }

  carregarDadosIniciais() {
    this.atividadeService.listar().subscribe({
      next: (res: any) => {
        this.eventosDisponiveis = res.content ? res.content : (Array.isArray(res) ? res : []);
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Erro ao carregar atividades', err)
    });

    this.visitanteService.listar().subscribe({
      next: (res: any) => {
        this.pessoasCadastradas = res.content ? res.content : (Array.isArray(res) ? res : []);
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Erro ao carregar visitantes', err)
    });
  }

  // ==========================================
  // LÓGICA DO AUTOCOMPLETE E PREENCHIMENTO RÁPIDO
  // ==========================================

  private removerAcentos(texto: string): string {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  filtrarNomes() {
    const termoOriginal = this.formCadastro.visitante.nome.trim();
    const termo = this.removerAcentos(termoOriginal.toLowerCase());

    if (termo.length > 0) {
      this.visitantesFiltrados = this.pessoasCadastradas
        .filter(v => {
          if (!v.nome) return false;
          const nomeNormalizado = this.removerAcentos(v.nome.toLowerCase());
          // Usamos includes para achar pelo sobrenome também (ex: digitar "Mendes" acha "Lorenzo Feltrin Mendes")
          return nomeNormalizado.includes(termo);
        })
        .sort((a, b) => a.nome.localeCompare(b.nome));

      this.exibirDropdownNomes = true;
    } else {
      this.exibirDropdownNomes = false;
      // Se apagar o nome todo, limpa a cidade também
      this.formCadastro.visitante.cidade = '';
    }
  }

  selecionarNome(visitante: any) {
    this.formCadastro.visitante.nome = visitante.nome;
    this.formCadastro.visitante.cidade = visitante.cidade;
    this.exibirDropdownNomes = false;
  }

  esconderDropdownNomes() {
    // O setTimeout garante que o clique na lista ocorra ANTES da lista sumir
    setTimeout(() => {
      this.exibirDropdownNomes = false;

      // Fallback: Se o usuário só apertar TAB sem clicar na lista, a gente tenta achar e preencher a cidade mesmo assim
      this.buscarCidadePorNome();
    }, 200);
  }

  buscarCidadePorNome() {
    const nomeLimpo = (this.formCadastro.visitante.nome || '').trim();
    if (!nomeLimpo) return;

    const visitanteConhecido = this.pessoasCadastradas.find(
      v => v.nome && v.nome.toLowerCase() === nomeLimpo.toLowerCase()
    );

    if (visitanteConhecido && !this.formCadastro.visitante.cidade) {
      this.formCadastro.visitante.cidade = visitanteConhecido.cidade;
    }
  }

  // ==========================================
  // LÓGICA DE SALVAR E GERENCIAR
  // ==========================================

  salvarCadastro() {
    if (!this.formCadastro.eventoSelecionado) {
      alert("Por favor, selecione uma atividade.");
      return;
    }

    if (this.formCadastro.acao === 'confirmar') {
      alert("Para confirmar a presença, abra a lista da atividade lá embaixo!");
      return;
    }

    let nomeFinal = '';
    let cidadeFinal = '';
    let quantidadeFinal = 1;

    if (this.formCadastro.tipoVisitante === 'individual') {
      nomeFinal = this.formCadastro.visitante.nome;
      cidadeFinal = this.formCadastro.visitante.cidade;
    } else {
      nomeFinal = this.formCadastro.instituicao.nome;
      if (this.formCadastro.responsavel.nome) {
        nomeFinal += ' (Resp: ' + this.formCadastro.responsavel.nome + ')';
      }
      cidadeFinal = this.formCadastro.instituicao.local || this.formCadastro.responsavel.cidade;
      quantidadeFinal = this.formCadastro.instituicao.quantidade || 2;
    }

    if (!nomeFinal || !cidadeFinal) {
      alert("Preencha os campos obrigatórios.");
      return;
    }

    const payload = {
      idAtividade: this.formCadastro.eventoSelecionado,
      nomeVisitante: nomeFinal,
      emailVisitante: null, // Sempre null pelo painel do funcionário
      cidadeVisitante: cidadeFinal,
      quantidade: quantidadeFinal
    };

    this.agendarService.agendar(payload).subscribe({
      next: () => {
        alert('Agendamento registrado!');
        this.formCadastro.visitante = { nome: '', cidade: '' };
        this.formCadastro.instituicao = { nome: '', quantidade: null, local: '' };
        this.formCadastro.responsavel = { nome: '', cidade: '' };
      },
      error: (err: any) => alert('Erro: ' + (err.error?.message || 'Falha no agendamento.'))
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
        const todosAgendamentos = res.content ? res.content : (Array.isArray(res) ? res : []);

        this.listaAgendamentos = todosAgendamentos
          .filter((a: any) => a.idAtividade === idAtividade)
          .map((a: any) => {
            return {
              ...a,
              cidadeDisplay: a.cidadeVisitante || a.cidade || 'Não informada'
            };
          });

        this.carregandoLista = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erro ao buscar lista', err);
        this.carregandoLista = false;
      }
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
      error: () => alert('Erro ao confirmar presença.')
    });
  }

  cancelarAgendamento(agendamento: any) {
    if (confirm(`Tem certeza que deseja cancelar a vaga de ${agendamento.nomeVisitante}?`)) {
      const id = agendamento.idAgendamento || agendamento.id;
      this.agendarService.cancelar(id).subscribe({
        next: () => {
          this.carregarListaAgendamentos(this.eventoSelecionadoParaGerenciar.idAtividade || this.eventoSelecionadoParaGerenciar.id);
        },
        error: () => alert('Erro ao cancelar agendamento.')
      });
    }
  }
}
