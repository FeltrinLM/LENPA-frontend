import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService, UsuarioLogado } from '../../core/services/auth/auth.service';
import { FuncionarioService } from '../../core/services/api/funcionario.service';

// IMPORTANDO OS COMPONENTES COMPARTILHADOS
import { BotaoPadraoComponent } from '../../shared/components/botao-padrao/botao-padrao.component';
import { BotaoFlutuanteComponent } from '../../shared/components/botao-flutuante/botao-flutuante.component';

@Component({
  selector: 'app-central-usuario',
  standalone: true,
  // ADICIONADOS AQUI
  imports: [CommonModule, FormsModule, ReactiveFormsModule, BotaoPadraoComponent, BotaoFlutuanteComponent],
  templateUrl: './central-usuario.html',
  styleUrls: [
    './css/central-usuario-layout.css',
    './css/central-usuario-perfil.css',
    './css/central-usuario-modais.css',
    './css/central-usuario-card-funcionarios.css'
  ]
})
export class CentralUsuario implements OnInit {

  private authService = inject(AuthService);
  private funcionarioService = inject(FuncionarioService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  usuario: UsuarioLogado | null = null;

  // ==========================================
  // FORMULÁRIOS REATIVOS
  // ==========================================
  formFuncionario: FormGroup = this.fb.group({
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    confirmarSenha: ['', Validators.required]
  }, { validators: this.validarSenhasIguais });

  private validarSenhasIguais(group: AbstractControl) {
    const senha = group.get('senha')?.value;
    const confirmarSenha = group.get('confirmarSenha')?.value;
    return senha === confirmarSenha ? null : { senhasDiferentes: true };
  }

  get fFunc() { return this.formFuncionario.controls; }

  // --- CONTROLES VISUAIS DO PERFIL ---
  editandoNome: boolean = false;
  nomeEditado: string = '';
  editandoEmail: boolean = false;
  emailEditado: string = '';
  editandoSenha: boolean = false;
  senhaAtual: string = '';
  novaSenha: string = '';
  erroSenha: string = '';

  modal = { exibir: false, titulo: '', mensagem: '', textoConfirmar: '', acaoConfirmar: () => {} };
  modalNovoUsuario = { exibir: false, nivelPermissao: '' };

  // ==========================================
  // CONTROLES DE GERENCIAMENTO (FUNCIONÁRIOS)
  // ==========================================
  exibirFuncionarios: boolean = false;
  funcionarios: any[] = [];
  carregandoFuncionarios: boolean = false;

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }
    this.usuario = this.authService.getDadosUsuario();
  }

  // ==========================================
  // NAVEGAÇÃO E GERENCIAMENTO DE FUNCIONÁRIOS
  // ==========================================
  abrirGerenciamentoFuncionarios() {
    this.exibirFuncionarios = !this.exibirFuncionarios;

    if (this.exibirFuncionarios) {
      this.carregarFuncionarios();
    }
  }

  carregarFuncionarios() {
    this.carregandoFuncionarios = true;
    this.funcionarioService.listar().subscribe({
      next: (res: any) => {
        let listaBruta = res.content ? res.content : (Array.isArray(res) ? res : []);
        this.funcionarios = listaBruta.filter((func: any) => func.email !== this.usuario?.email);
        this.carregandoFuncionarios = false;

        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erro ao buscar funcionários:', err);
        this.carregandoFuncionarios = false;
        this.cdr.detectChanges();
        alert('Erro ao carregar a lista de funcionários.');
      }
    });
  }

  confirmarExclusaoFuncionario(func: any) {
    this.abrirModal(
      'Atenção!',
      `Deseja mesmo excluir o ${func.nivelPermissao.toLowerCase()} ${func.nome} do sistema?`,
      'Sim, excluir',
      () => this.executarExclusaoFuncionario(func.idFuncionario)
    );
  }

  private executarExclusaoFuncionario(id: number) {
    this.funcionarioService.excluir(id).subscribe({
      next: () => {
        this.fecharModal();
        alert('Funcionário excluído com sucesso!');
        this.carregarFuncionarios();
      },
      error: (err: any) => {
        this.fecharModal();
        alert(err.error?.message || 'Erro ao excluir o funcionário.');
      }
    });
  }

  // ==========================================
  // ATUALIZAR NOME, EMAIL E SENHA DO PERFIL
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
  // CRIAR NOVO USUÁRIO (SISTEMA LENPA)
  // ==========================================
  abrirModalNovoUsuario() {
    this.modalNovoUsuario = { exibir: true, nivelPermissao: '' };
    this.formFuncionario.reset();
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
    } else {
      alert('Selecione o nível de permissão do usuário.');
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
      next: () => {
        alert(`${nivel} cadastrado com sucesso!`);
        this.fecharModalNovoUsuario();

        if (this.exibirFuncionarios) {
          this.carregarFuncionarios();
        }
      },
      error: (err: any) => alert(err.error?.message || 'Erro ao cadastrar funcionário.')
    });
  }

  // ==========================================
  // MODAIS GENÉRICOS
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
