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

  // --- EDIÇÃO DE PERFIL ---
  editandoNome: boolean = false;
  nomeEditado: string = '';

  editandoEmail: boolean = false;
  emailEditado: string = '';

  editandoSenha: boolean = false;
  senhaAtual: string = '';
  novaSenha: string = '';
  erroSenha: string = '';

  // --- MODAL DINÂMICO ---
  modal = {
    exibir: false,
    titulo: '',
    mensagem: '',
    textoConfirmar: '',
    acaoConfirmar: () => {}
  };

  // --- CADASTRO DE NOVO USUÁRIO ---
  modalNovoUsuario = {
    exibir: false,
    nivelPermissao: '',
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    nomeCompleto: '',
    cidade: ''
  };

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }
    this.usuario = this.authService.getDadosUsuario();
  }

  // ==========================================
  // ATUALIZAR NOME E EMAIL
  // ==========================================
  editarNome() {
    this.nomeEditado = this.usuario?.nome || '';
    this.editandoNome = true;
  }

  salvarNome() {
    if (!this.usuario) return;
    const dados = { nome: this.nomeEditado, email: this.usuario.email };

    this.authService.atualizarPerfil(dados).subscribe({
      next: () => {
        this.usuario!.nome = this.nomeEditado;
        this.editandoNome = false;
        alert('Nome atualizado com sucesso!');
      },
      error: (err: any) => alert(err.error?.message || 'Erro ao atualizar nome.')
    });
  }

  editarEmail() {
    this.emailEditado = this.usuario?.email || '';
    this.editandoEmail = true;
  }

  salvarEmail() {
    if (!this.usuario) return;
    const dados = { nome: this.usuario.nome, email: this.emailEditado };

    this.authService.atualizarPerfil(dados).subscribe({
      next: () => {
        this.usuario!.email = this.emailEditado;
        this.editandoEmail = false;
        alert('E-mail atualizado com sucesso!');
      },
      error: (err: any) => alert(err.error?.message || 'Erro ao atualizar e-mail.')
    });
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
  // TROCA DE SENHA
  // ==========================================
  editarSenha() {
    this.editandoSenha = true;
    this.senhaAtual = '';
    this.novaSenha = '';
    this.erroSenha = '';
  }

  tentarSalvarSenha() {
    this.erroSenha = '';
    if (!this.senhaAtual) { this.erroSenha = 'Por favor, informe a senha atual.'; return; }
    if (!this.novaSenha) { this.erroSenha = 'A nova senha não pode ficar em branco.'; return; }
    if (this.senhaAtual === this.novaSenha) { this.erroSenha = 'A nova senha deve ser diferente da atual.'; return; }

    this.abrirModal(
      'Confirmar Alteração',
      'Deseja realmente alterar a sua senha?',
      'Sim, alterar',
      () => this.executarTrocaSenha()
    );
  }

  executarTrocaSenha() {
    const dados = { senhaAtual: this.senhaAtual, novaSenha: this.novaSenha };
    this.authService.alterarSenha(dados).subscribe({
      next: () => {
        this.fecharModal();
        this.editandoSenha = false;
        alert('Senha alterada com sucesso!');
      },
      error: (err: any) => {
        this.fecharModal();
        this.erroSenha = err.error?.message || 'Erro ao alterar senha.';
      }
    });
  }

  // ==========================================
  // CRIAR NOVO USUÁRIO (LÓGICA HIERÁRQUICA)
  // ==========================================
  abrirModalNovoUsuario() {
    // Verificamos se o usuário atual é Bolsista (Ajustado para 'BOLSISTA')
    const eBolsista = this.usuario?.role === 'BOLSISTA';

    this.modalNovoUsuario = {
      exibir: true,
      nivelPermissao: eBolsista ? 'Visitante' : '',
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: '',
      nomeCompleto: '',
      cidade: ''
    };
  }

  fecharModalNovoUsuario() { this.modalNovoUsuario.exibir = false; }

  confirmarNovoUsuario() {
    const nivel = this.modalNovoUsuario.nivelPermissao;
    if (!nivel) { alert('Selecione um nível de permissão!'); return; }

    if (nivel === 'Administrador' || nivel === 'Bolsista') {
      if (this.modalNovoUsuario.senha !== this.modalNovoUsuario.confirmarSenha) {
        alert('As senhas não coincidem!');
        return;
      }

      const payload = {
        nome: this.modalNovoUsuario.nome,
        email: this.modalNovoUsuario.email,
        senha: this.modalNovoUsuario.senha,
        nivelPermissao: nivel === 'Administrador' ? 'ADMINISTRADOR' : 'BOLSISTA'
      };

      this.authService.cadastrarFuncionario(payload).subscribe({
        next: () => {
          alert(`${nivel} cadastrado com sucesso!`);
          this.fecharModalNovoUsuario();
        },
        error: (err: any) => alert(err.error?.message || 'Erro ao cadastrar funcionário.')
      });
    } else {
      console.log('Dados do visitante:', this.modalNovoUsuario);
      alert('Cadastro de visitante em processamento...');
      this.fecharModalNovoUsuario();
    }
  }

  // ==========================================
  // LOGOUT E AUXILIARES
  // ==========================================
  abrirModalSair() {
    this.abrirModal('Deseja sair?', 'Você precisará fazer login novamente.', 'Sim, sair', () => {
      this.authService.logout();
      this.router.navigate(['/']);
    });
  }

  abrirModal(titulo: string, mensagem: string, textoConfirmar: string, acao: () => void) {
    this.modal = { exibir: true, titulo, mensagem, textoConfirmar, acaoConfirmar: acao };
  }

  fecharModal() { this.modal.exibir = false; }
}
