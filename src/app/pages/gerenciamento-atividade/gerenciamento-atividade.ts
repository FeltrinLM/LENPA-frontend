import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gerenciamento-atividade',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gerenciamento-atividade.html',
  styleUrl: './gerenciamento-atividade.css'
})
export class GerenciamentoAtividade {

  // 🔴 INTEGRAÇÃO API: Esta lista de eventos ativos virá do backend (ex: GET /api/eventos/ativos)
  eventosDisponiveis = [
    { id: 1, nome: 'Exposição de espécies de abelhas nativas' },
    { id: 2, nome: 'Exposição de flores originarias do RS' }
  ];

  // 🔴 INTEGRAÇÃO API: Esta lista virá do backend (ex: GET /api/pessoas)
  pessoasCadastradas = [
    { id: 1, nome: 'Maria Clara' },
    { id: 2, nome: 'Lucas Mendes' },
    { id: 3, nome: 'Miguel Martins' }
  ];

  // O "Cérebro" do nosso formulário condicional
  formCadastro = {
    eventoSelecionado: '',       // <-- NOVO CAMPO AQUI
    acao: 'agendar',
    tipoVisitante: 'individual',

    pessoaSelecionada: '',
    novaPessoa: { nome: '', cidade: '' },

    instituicao: { nome: '', quantidade: null, local: '' },
    responsavelSelecionado: '',
    novoResponsavel: { nome: '', cidade: '' }
  };

  // 🔴 INTEGRAÇÃO API: Método disparado ao clicar no botão
  salvarCadastro() {
    // Trava de segurança no frontend:
    if (!this.formCadastro.eventoSelecionado) {
      alert("Por favor, selecione uma atividade antes de continuar!");
      return;
    }

    console.log("Dados prontos para enviar pro Java:", this.formCadastro);

    if (this.formCadastro.tipoVisitante === 'individual') {
      if (this.formCadastro.pessoaSelecionada === 'novo') {
        alert(`Evento ID: ${this.formCadastro.eventoSelecionado} | Criando nova pessoa: ${this.formCadastro.novaPessoa.nome} e agendando!`);
      } else {
        alert(`Evento ID: ${this.formCadastro.eventoSelecionado} | Agendando pessoa ID: ${this.formCadastro.pessoaSelecionada}`);
      }
    } else {
      alert(`Evento ID: ${this.formCadastro.eventoSelecionado} | Cadastrando instituição/grupo: ${this.formCadastro.instituicao.nome}`);
    }
  }
}
