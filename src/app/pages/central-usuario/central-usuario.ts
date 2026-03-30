import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, UsuarioLogado } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-central-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './central-usuario.html',
  styleUrl: './central-usuario.css',
})
export class CentralUsuario implements OnInit {

  private authService = inject(AuthService);
  private router = inject(Router);

  usuario: UsuarioLogado | null = null;

  // --- VARIÁVEIS DE EDIÇÃO ---
  editandoNome: boolean = false;
  nomeEditado: string = '';

  editandoEmail: boolean = false;
  emailEditado: string = '';

  editandoSenha: boolean = false;
  senhaAtual: string = '';
  novaSenha: string = '';
  erroSenha: string = '';

  // --- CONFIGURAÇÃO DO MODAL DINÂMICO ÚNICO ---
  modal = {
    exibir: false,
    titulo: '',
    mensagem: '',
    textoConfirmar: '',
    acaoConfirmar: () => {}
  };

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }
    this.usuario = this.authService.getDadosUsuario();
  }

  // ==========================================
  // LÓGICA DE EDIÇÃO SIMPLES (NOME E E-MAIL)
  // ==========================================
  editarNome() {
    this.nomeEditado = this.usuario?.nome || '';
    this.editandoNome = true;
  }

  salvarNome() {
    if (this.usuario) this.usuario.nome = this.nomeEditado;
    this.editandoNome = false;
  }

  editarEmail() {
    this.emailEditado = this.usuario?.email || '';
    this.editandoEmail = true;
  }

  salvarEmail() {
    if (this.usuario) this.usuario.email = this.emailEditado;
    this.editandoEmail = false;
  }

  cancelarEdicao(campo: 'nome' | 'email' | 'senha') {
    if (campo === 'nome') this.editandoNome = false;
    if (campo === 'email') this.editandoEmail = false;
    if (campo === 'senha') {
      this.editandoSenha = false;
      this.erroSenha = '';
    }
  }

  // ==========================================
  // LÓGICA DE SENHA
  // ==========================================
  editarSenha() {
    this.editandoSenha = true;
    this.senhaAtual = '';
    this.novaSenha = '';
    this.erroSenha = '';
  }

  tentarSalvarSenha() {
    this.erroSenha = '';

    if (!this.senhaAtual || this.senhaAtual.trim() === '') {
      this.erroSenha = 'Por favor, informe a senha atual.';
      return;
    }
    if (!this.novaSenha || this.novaSenha.trim() === '') {
      this.erroSenha = 'A nova senha não pode ficar em branco.';
      return;
    }
    if (this.senhaAtual === this.novaSenha) {
      this.erroSenha = 'A nova senha deve ser diferente da atual.';
      return;
    }

    this.abrirModal(
      'Confirmar Alteração',
      'Deseja realmente alterar a sua senha de acesso ao sistema?',
      'Sim, alterar',
      () => this.executarTrocaSenha()
    );
  }

  executarTrocaSenha() {
    console.log('Senha alterada visualmente com sucesso!');
    this.editandoSenha = false;
    this.fecharModal();
  }

  // ==========================================
  // CONTROLE DO MODAL DINÂMICO E LOGOUT
  // ==========================================
  abrirModalSair() {
    this.abrirModal(
      'Deseja sair?',
      'Você precisará fazer login novamente para acessar o sistema.',
      'Sim, sair',
      () => {
        this.authService.logout();
        this.router.navigate(['/']);
      }
    );
  }

  abrirModal(titulo: string, mensagem: string, textoConfirmar: string, acao: () => void) {
    this.modal = { exibir: true, titulo, mensagem, textoConfirmar, acaoConfirmar: acao };
  }

  fecharModal() {
    this.modal.exibir = false;
  }

  modalNovoUsuario = {
    exibir: false,
    nivelPermissao: '' // Começa vazio para forçar a escolha
  };

  // ==========================================
  // LÓGICA DE CADASTRO DE NOVO USUÁRIO
  // ==========================================
  abrirModalNovoUsuario() {
    this.modalNovoUsuario.nivelPermissao = ''; // Reseta sempre que abrir
    this.modalNovoUsuario.exibir = true;
  }

  fecharModalNovoUsuario() {
    this.modalNovoUsuario.exibir = false;
  }

  confirmarNovoUsuario() {
    if (!this.modalNovoUsuario.nivelPermissao) {
      // Pequena validação visual rápida se ele tentar avançar sem escolher
      alert('Selecione um nível de permissão antes de continuar!');
      return;
    }

    console.log('Iniciando cadastro para:', this.modalNovoUsuario.nivelPermissao);
    // Aqui no futuro a gente avança para o próximo passo ou fecha
    this.fecharModalNovoUsuario();
  }
}
