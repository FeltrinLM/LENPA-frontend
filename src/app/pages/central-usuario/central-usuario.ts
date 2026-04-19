import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService, UsuarioLogado } from '../../core/services/auth/auth.service';
import { FuncionarioService } from '../../core/services/api/funcionario.service';
import { VisitanteService } from '../../core/services/api/visitante.service';

@Component({
  selector: 'app-central-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './central-usuario.html',
  styleUrls: [
    './css/central-usuario-layout.css',
    './css/central-usuario-perfil.css',
    './css/central-usuario-modais.css'
  ]
})
export class CentralUsuario implements OnInit {

  private authService = inject(AuthService);
  private funcionarioService = inject(FuncionarioService);
  private visitanteService = inject(VisitanteService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  usuario: UsuarioLogado | null = null;

  // ==========================================
  // FORMULÁRIOS REATIVOS (Inicialização Imediata)
  // ==========================================

  formFuncionario: FormGroup = this.fb.group({
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    confirmarSenha: ['', Validators.required]
  }, { validators: this.validarSenhasIguais });

  formVisitante: FormGroup = this.fb.group({
    nomeCompleto: ['', Validators.required],
    cidade: ['', Validators.required]
  });

  // Validador com a tipagem correta exigida pelo Angular (AbstractControl)
  private validarSenhasIguais(group: AbstractControl) {
    const senha = group.get('senha')?.value;
    const confirmarSenha = group.get('confirmarSenha')?.value;
    return senha === confirmarSenha ? null : { senhasDiferentes: true };
  }

  // Atalhos blindados para o HTML
  get fFunc() { return this.formFuncionario.controls; }
  get fVis() { return this.formVisitante.controls; }

  // --- CONTROLES VISUAIS ---
  editandoNome: boolean = false;
  nomeEditado: string = '';
  editandoEmail: boolean = false;
  emailEditado: string = '';
  editandoSenha: boolean = false;
  senhaAtual: string = '';
  novaSenha: string = '';
  erroSenha: string = '';

  modal = { exibir: false, titulo: '', mensagem: '', textoConfirmar: '', acaoConfirmar: () => {} };

  modalNovoUsuario = {
    exibir: false,
    nivelPermissao: ''
  };

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }
    this.usuario = this.authService.getDadosUsuario();
  }

  // ==========================================
  // ATUALIZAR NOME, EMAIL E SENHA
  // ==========================================
  editarNome() { this.nomeEditado = this.usuario?.nome || ''; this.editandoNome = true; }
  salvarNome() {
    if (!this.usuario) return;
    const dados = { nome: this.nomeEditado, email: this.usuario.email };
    this.funcionarioService.atualizarPerfil(dados).subscribe({
      next: () => { this.usuario!.nome = this.nomeEditado; this.editandoNome = false; alert('Nome atualizado com sucesso!'); },
      error: (err: any) => alert(err.error?.message || 'Erro ao atualizar nome.')
    });
  }

  editarEmail() { this.emailEditado = this.usuario?.email || ''; this.editandoEmail = true; }
  salvarEmail() {
    if (!this.usuario) return;
    const dados = { nome: this.usuario.nome, email: this.emailEditado };
    this.funcionarioService.atualizarPerfil(dados).subscribe({
      next: () => { this.usuario!.email = this.emailEditado; this.editandoEmail = false; alert('E-mail atualizado com sucesso!'); },
      error: (err: any) => alert(err.error?.message || 'Erro ao atualizar e-mail.')
    });
  }

  cancelarEdicao(campo: 'nome' | 'email' | 'senha') {
    if (campo === 'nome') this.editandoNome = false;
    if (campo === 'email') this.editandoEmail = false;
    if (campo === 'senha') { this.editandoSenha = false; this.erroSenha = ''; }
  }

  editarSenha() { this.editandoSenha = true; this.senhaAtual = ''; this.novaSenha = ''; this.erroSenha = ''; }
  tentarSalvarSenha() {
    this.erroSenha = '';
    if (!this.senhaAtual) { this.erroSenha = 'Por favor, informe a senha atual.'; return; }
    if (!this.novaSenha) { this.erroSenha = 'A nova senha não pode ficar em branco.'; return; }
    if (this.senhaAtual === this.novaSenha) { this.erroSenha = 'A nova senha deve ser diferente da atual.'; return; }
    this.abrirModal('Confirmar Alteração', 'Deseja realmente alterar a sua senha?', 'Sim, alterar', () => this.executarTrocaSenha());
  }
  executarTrocaSenha() {
    const dados = { senhaAtual: this.senhaAtual, novaSenha: this.novaSenha };
    this.funcionarioService.alterarSenha(dados).subscribe({
      next: () => { this.fecharModal(); this.editandoSenha = false; alert('Senha alterada com sucesso!'); },
      error: (err: any) => { this.fecharModal(); this.erroSenha = err.error?.message || 'Erro ao alterar senha.'; }
    });
  }

  // ==========================================
  // CRIAR NOVO USUÁRIO
  // ==========================================
  abrirModalNovoUsuario() {
    const eBolsista = this.usuario?.role === 'BOLSISTA';
    this.modalNovoUsuario = { exibir: true, nivelPermissao: eBolsista ? 'Visitante' : '' };

    // Limpa os formulários ao abrir
    this.formFuncionario.reset();
    this.formVisitante.reset();
  }

  fecharModalNovoUsuario() { this.modalNovoUsuario.exibir = false; }

  confirmarNovoUsuario() {
    const nivel = this.modalNovoUsuario.nivelPermissao;

    if (nivel === 'Administrador' || nivel === 'Bolsista') {
      if (this.formFuncionario.invalid) {
        this.formFuncionario.markAllAsTouched();
        return;
      }
      this.salvarFuncionario(nivel);

    } else if (nivel === 'Visitante') {
      if (this.formVisitante.invalid) {
        this.formVisitante.markAllAsTouched();
        return;
      }
      this.salvarVisitante();
    }
  }

  private salvarFuncionario(nivel: string) {
    const payload = {
      nome: this.formFuncionario.value.nome,
      email: this.formFuncionario.value.email,
      senha: this.formFuncionario.value.senha,
      nivelPermissao: nivel === 'Administrador' ? 'ADMINISTRADOR' : 'BOLSISTA'
    };

    this.funcionarioService.cadastrar(payload).subscribe({
      next: () => { alert(`${nivel} cadastrado com sucesso!`); this.fecharModalNovoUsuario(); },
      error: (err: any) => alert(err.error?.message || 'Erro ao cadastrar funcionário.')
    });
  }

  private salvarVisitante() {
    const payload = {
      nome: this.formVisitante.value.nomeCompleto,
      cidade: this.formVisitante.value.cidade
    };

    this.visitanteService.cadastrar(payload).subscribe({
      next: () => { alert('Visitante cadastrado com sucesso!'); this.fecharModalNovoUsuario(); },
      error: (err: any) => alert(err.error?.message || 'Erro ao cadastrar visitante.')
    });
  }

  // ==========================================
  // LOGOUT E AUXILIARES
  // ==========================================
  abrirModalSair() { this.abrirModal('Deseja sair?', 'Você precisará fazer login novamente.', 'Sim, sair', () => { this.authService.logout(); this.router.navigate(['/']); }); }
  abrirModal(titulo: string, mensagem: string, textoConfirmar: string, acao: () => void) { this.modal = { exibir: true, titulo, mensagem, textoConfirmar, acaoConfirmar: acao }; }
  fecharModal() { this.modal.exibir = false; }

  abrirGerenciamentoVisitantes() {
    alert('Área de gerenciamento de visitantes em construção.');
    // this.router.navigate(['/gerenciar-visitantes']);
  }

  abrirGerenciamentoFuncionarios() {
    alert('Área de gerenciamento de funcionários em construção.');
    // this.router.navigate(['/gerenciar-funcionarios']);
  }
}
