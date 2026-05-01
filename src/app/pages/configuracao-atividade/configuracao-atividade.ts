import { Component, OnInit, inject, ChangeDetectorRef  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AtividadeService } from '../../core/services/api/atividade.service';

// IMPORTANDO OS COMPONENTES
import { BotaoPadraoComponent } from '../../shared/components/botao-padrao/botao-padrao.component';
import { BotaoFlutuanteComponent } from '../../shared/components/botao-flutuante/botao-flutuante.component';
import { IconeComponent } from '../../shared/components/icone/icone.component'; // <-- IMPORT ADICIONADO AQUI

@Component({
  selector: 'app-configuracao-atividade',
  standalone: true,
  // ADICIONADO AQUI NO ARRAY DE IMPORTS
  imports: [CommonModule, FormsModule, ReactiveFormsModule, BotaoPadraoComponent, BotaoFlutuanteComponent, IconeComponent],
  templateUrl: './configuracao-atividade.html',
  styleUrls: [
    './css/card-atividade.css',
    './css/layout-base.css',
    './css/overlays.css'
  ]
})
export class ConfiguracaoAtividade implements OnInit {

  private router = inject(Router);
  private atividadeService = inject(AtividadeService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  // --- CONTROLES GERAIS ---
  salvando = false;
  atividadesCadastradas: any[] = [];

  // --- MODAL NOVA ATIVIDADE ---
  exibirModal = false;
  isDragging = false;
  formAtividade!: FormGroup;
  arquivoImagem: File | null = null;
  imagemPreview: string | ArrayBuffer | null | undefined = null;

  // --- MODAL DE EXCLUSÃO ---
  exibirModalExclusao = false;
  atividadeParaExcluir: number | null = null;
  excluindo = false;

  // --- EDIÇÃO INLINE (O PROTÓTIPO) ---
  atividadeEmEdicao: number | null = null;
  formEdicao!: FormGroup;
  arquivoImagemEdicao: File | null = null;
  imagemPreviewEdicao: string | ArrayBuffer | null | undefined = null;

  ngOnInit(): void {
    this.formAtividade = this.fb.group({
      nome: ['', Validators.required],
      tipo: ['', Validators.required],
      vagas: [null, [Validators.required, Validators.min(1)]],
      data: ['', Validators.required],
      horarioInicio: ['', Validators.required],
      horarioFim: ['', Validators.required],
      local: ['', Validators.required],
      descricao: ['']
    });

    this.carregarAtividades();
  }

  get f() { return this.formAtividade.controls; }

  carregarAtividades() {
    this.atividadeService.listar().subscribe({
      next: (res) => {
        this.atividadesCadastradas = res.content || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao buscar atividades', err)
    });
  }

  // ==========================================
  // LÓGICA DE EDIÇÃO INLINE
  // ==========================================
  iniciarEdicao(ativ: any) {
    this.atividadeEmEdicao = ativ.idAtividade;

    this.formEdicao = this.fb.group({
      idAtividade: [ativ.idAtividade],
      nome: [ativ.nome, Validators.required],
      tipo: [ativ.tipo, Validators.required],
      vagas: [ativ.vagas, [Validators.required, Validators.min(1)]],
      data: [ativ.data, Validators.required],
      horario: [ativ.horario, Validators.required],
      local: [ativ.local, Validators.required],
      descricao: [ativ.descricao]
    });

    this.arquivoImagemEdicao = null;
    this.imagemPreviewEdicao = null;
  }

  cancelarEdicao() {
    this.atividadeEmEdicao = null;
  }

  aoSelecionarArquivoEdicao(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      if (!file.type.startsWith('image/')) return;

      this.arquivoImagemEdicao = file;
      const reader = new FileReader();
      reader.onload = (e) => this.imagemPreviewEdicao = e.target?.result;
      reader.readAsDataURL(file);
    }
  }

  salvarEdicao() {
    if (this.formEdicao.invalid) return;

    this.salvando = true;
    const payload = this.formEdicao.value;

    const ativAntiga = this.atividadesCadastradas.find(a => a.idAtividade === payload.idAtividade);
    payload.imagem = ativAntiga.imagem;

    if (this.arquivoImagemEdicao) {
      this.atividadeService.uploadImagem(this.arquivoImagemEdicao).subscribe({
        next: (res) => {
          payload.imagem = res.url;
          this.enviarEdicaoFinal(payload);
        },
        error: () => {
          alert('Erro no upload da nova imagem');
          this.salvando = false;
        }
      });
    } else {
      this.enviarEdicaoFinal(payload);
    }
  }

  private enviarEdicaoFinal(payload: any) {
    this.atividadeService.atualizar(payload).subscribe({
      next: () => {
        this.atividadeEmEdicao = null;
        this.salvando = false;
        this.carregarAtividades();
      },
      error: (err) => {
        console.error('Erro na atualização:', err);
        alert('Erro ao atualizar atividade.');
        this.salvando = false;
      }
    });
  }

  // ==========================================
  // MODAIS E CRIAÇÃO
  // ==========================================
  abrirModalNovaAtividade() {
    this.exibirModal = true;
    this.formAtividade.reset();
    this.formAtividade.get('tipo')?.setValue('');
    this.arquivoImagem = null;
    this.imagemPreview = null;
  }

  fecharModalNovaAtividade() {
    this.exibirModal = false;
    this.salvando = false;
  }

  abrirModalExclusao(id: number) {
    this.atividadeParaExcluir = id;
    this.exibirModalExclusao = true;
  }

  fecharModalExclusao() {
    this.exibirModalExclusao = false;
    this.atividadeParaExcluir = null;
  }

  confirmarExclusao() {
    if (this.atividadeParaExcluir === null) return;
    this.excluindo = true;
    this.atividadeService.excluir(this.atividadeParaExcluir).subscribe({
      next: () => {
        this.fecharModalExclusao();
        this.carregarAtividades();
        this.excluindo = false;
      },
      error: () => {
        alert('Erro ao excluir a atividade.');
        this.fecharModalExclusao();
        this.excluindo = false;
      }
    });
  }

  aoArrastarSobre(event: DragEvent) { event.preventDefault(); event.stopPropagation(); this.isDragging = true; }
  aoSairArrastar(event: DragEvent) { event.preventDefault(); event.stopPropagation(); this.isDragging = false; }
  aoSoltarArquivo(event: DragEvent) {
    event.preventDefault(); event.stopPropagation(); this.isDragging = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) this.processarArquivo(event.dataTransfer.files[0]);
  }
  aoSelecionarArquivo(event: any) {
    if (event.target.files && event.target.files.length > 0) this.processarArquivo(event.target.files[0]);
  }

  processarArquivo(file: File) {
    if (!file.type.startsWith('image/')) return;
    this.arquivoImagem = file;
    const reader = new FileReader();
    reader.onload = (e) => this.imagemPreview = e.target?.result;
    reader.readAsDataURL(file);
  }
  removerImagem(event: Event) { event.stopPropagation(); this.arquivoImagem = null; this.imagemPreview = null; }

  salvarAtividade() {
    if (this.formAtividade.invalid) { this.formAtividade.markAllAsTouched(); return; }
    this.salvando = true;
    const formVals = this.formAtividade.value;
    const horarioFormatado = `${formVals.horarioInicio} às ${formVals.horarioFim}`;

    const payload = {
      nome: formVals.nome,
      data: formVals.data,
      horario: horarioFormatado,
      local: formVals.local,
      tipo: formVals.tipo,
      vagas: formVals.vagas,
      descricao: formVals.descricao,
      imagem: ''
    };

    if (this.arquivoImagem) {
      this.atividadeService.uploadImagem(this.arquivoImagem).subscribe({
        next: (res) => { payload.imagem = res.url; this.enviarPayloadFinal(payload); },
        error: () => { alert('Erro ao enviar a imagem.'); this.salvando = false; }
      });
    } else {
      this.enviarPayloadFinal(payload);
    }
  }

  private enviarPayloadFinal(payload: any) {
    this.atividadeService.cadastrar(payload).subscribe({
      next: () => { this.fecharModalNovaAtividade(); this.carregarAtividades(); },
      error: () => { alert('Erro ao cadastrar a atividade.'); this.salvando = false; }
    });
  }
}
