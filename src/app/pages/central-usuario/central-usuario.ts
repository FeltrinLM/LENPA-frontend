import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
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
    './css/central-usuario-modais.css',
    './css/central-usuario-card-visitantes.css',
    './css/central-usuario-card-funcionarios.css'
  ]
})
export class CentralUsuario implements OnInit {

  private authService = inject(AuthService);
  private funcionarioService = inject(FuncionarioService);
  private visitanteService = inject(VisitanteService);
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

  formVisitante: FormGroup = this.fb.group({
    nomeCompleto: ['', Validators.required],
    cidade: ['', Validators.required]
  });

  private validarSenhasIguais(group: AbstractControl) {
    const senha = group.get('senha')?.value;
    const confirmarSenha = group.get('confirmarSenha')?.value;
    return senha === confirmarSenha ? null : { senhasDiferentes: true };
  }

  get fFunc() { return this.formFuncionario.controls; }
  get fVis() { return this.formVisitante.controls; }

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
  // CONTROLES DE GERENCIAMENTO (VISITANTES)
  // ==========================================
  exibirVisitantes: boolean = false;
  visitantes: any[] = [];
  visitantesFiltrados: any[] = [];
  termoBuscaVisitante: string = '';
  carregandoVisitantes: boolean = false;

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
  // NAVEGAÇÃO E GERENCIAMENTO DE VISITANTES
  // ==========================================
  abrirGerenciamentoVisitantes() {
    this.exibirVisitantes = !this.exibirVisitantes;

    if (this.exibirVisitantes) {
      this.carregarVisitantes();
    } else {
      this.termoBuscaVisitante = '';
    }
  }

  carregarVisitantes() {
    this.carregandoVisitantes = true;
    this.visitanteService.listar().subscribe({
      next: (res: any) => {
        this.visitantes = res.content ? res.content : (Array.isArray(res) ? res : []);
        this.visitantesFiltrados = [...this.visitantes];
        this.carregandoVisitantes = false;

        this.cdr.detectChanges(); // <-- FORÇA O ANGULAR A ATUALIZAR A TELA AGORA
      },
      error: (err: any) => {
        console.error('Erro ao buscar visitantes:', err);
        this.carregandoVisitantes = false;
        this.cdr.detectChanges(); // Garante que a tela saia do loading se der erro também
        alert('Erro ao carregar a lista de visitantes.');
      }
    });
  }

  filtrarVisitantes() {
    const termo = this.termoBuscaVisitante.toLowerCase().trim();
    if (!termo) {
      this.visitantesFiltrados = [...this.visitantes];
      return;
    }

    this.visitantesFiltrados = this.visitantes.filter(v =>
      (v.nome && v.nome.toLowerCase().includes(termo)) ||
      (v.cidade && v.cidade.toLowerCase().includes(termo))
    );
  }

  confirmarExclusaoVisitante(vis: any) {
    this.abrirModal(
      'Atenção!',
      `Deseja mesmo excluir o visitante ${vis.nome} do sistema?`,
      'Sim, excluir',
      () => this.executarExclusaoVisitante(vis.id) // ATENÇÃO: Verifique se o seu DTO usa 'id' ou 'idVisitante'
    );
  }

  private executarExclusaoVisitante(id: number) {
    this.visitanteService.excluir(id).subscribe({
      next: () => {
        this.fecharModal();
        alert('Visitante excluído com sucesso!');
        this.carregarVisitantes(); // Recarrega a lista para remover o card da tela
      },
      error: (err: any) => {
        this.fecharModal();
        alert(err.error?.message || 'Erro ao excluir o visitante.');
      }
    });
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

        this.cdr.detectChanges(); // <-- FORÇA O ANGULAR A ATUALIZAR A TELA AGORA
      },
      error: (err: any) => {
        console.error('Erro ao buscar funcionários:', err);
        this.carregandoFuncionarios = false;
        this.cdr.detectChanges(); // Garante que a tela saia do loading se der erro também
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
    this.formFuncionario.reset();
    this.formVisitante.reset();
  }

  fecharModalNovoUsuario() { this.modalNovoUsuario.exibir = false; }

  confirmarNovoUsuario() {
    const nivel = this.modalNovoUsuario.nivelPermissao;
    if (nivel === 'Administrador' || nivel === 'Bolsista') {
      if (this.formFuncionario.invalid) { this.formFuncionario.markAllAsTouched(); return; }
      this.salvarFuncionario(nivel);
    } else if (nivel === 'Visitante') {
      if (this.formVisitante.invalid) { this.formVisitante.markAllAsTouched(); return; }
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
      cidade: this.formVisitante.value.cidade,
      tipo: 'INDIVIDUAL'
    };
    this.visitanteService.cadastrar(payload).subscribe({
      next: () => {
        alert('Visitante cadastrado com sucesso!');
        this.fecharModalNovoUsuario();

        if (this.exibirVisitantes) {
          this.carregarVisitantes();
        }
      },
      error: (err: any) => alert(err.error?.message || 'Erro ao cadastrar visitante.')
    });
  }

  // ==========================================
  // SALVAR EDIÇÃO DO VISITANTE
  // ==========================================
  salvarVisitanteEditado(vis: any, campo: string) {
    // Monta o objeto de acordo com o que o Java espera em DadosAtualizacaoVisitante
    const payload = {
      id: vis.id,
      nome: vis.nome,
      cidade: vis.cidade,
      tipo: vis.tipo // Envia o tipo atual junto
    };

    this.visitanteService.atualizar(payload).subscribe({
      next: () => {
        // Esconde o botão de salvar depois do sucesso
        if (campo === 'nome') vis._nomeModificado = false;
        if (campo === 'cidade') vis._cidadeModificada = false;

        this.cdr.detectChanges(); // Atualiza a tela
      },
      error: (err: any) => {
        alert(err.error?.message || `Erro ao atualizar ${campo} do visitante.`);
      }
    });
  }

  abrirModalSair() { this.abrirModal('Deseja sair?', 'Você precisará fazer login novamente.', 'Sim, sair', () => { this.authService.logout(); this.router.navigate(['/']); }); }
  abrirModal(titulo: string, mensagem: string, textoConfirmar: string, acao: () => void) { this.modal = { exibir: true, titulo, mensagem, textoConfirmar, acaoConfirmar: acao }; }
  fecharModal() { this.modal.exibir = false; }
}
