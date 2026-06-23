import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AtividadeService } from '../../core/services/api/atividade.service';

// IMPORTANDO OS COMPONENTES
import { BotaoPadraoComponent } from '../../shared/components/botao-padrao/botao-padrao.component';
import { BotaoFlutuanteComponent } from '../../shared/components/botao-flutuante/botao-flutuante.component';
import { IconeComponent } from '../../shared/components/icone/icone.component';

@Component({
  selector: 'app-configuracao-atividade',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BotaoPadraoComponent,
    BotaoFlutuanteComponent,
    IconeComponent,
  ],
  templateUrl: './configuracao-atividade.html',
  styleUrls: ['./css/card-atividade.css', './css/layout-base.css', './css/overlays.css'],
})
export class ConfiguracaoAtividade implements OnInit {
  private router = inject(Router);
  private atividadeService = inject(AtividadeService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  // --- CONTROLES GERAIS ---
  salvando = false;
  atividadesCadastradas: any[] = [];
  dataMinima: string = '';

  timestampImagem: number = Date.now();

  // --- MODAL NOVA ATIVIDADE ---
  exibirModal = false;
  isDragging = false;
  formAtividade!: FormGroup;
  arquivoImagem: File | null = null;
  imagemPreview: string | ArrayBuffer | null | undefined = null;

  // --- EDIÇÃO INLINE ---
  atividadeEmEdicao: number | null = null;
  formEdicao!: FormGroup;
  arquivoImagemEdicao: File | null = null;
  imagemPreviewEdicao: string | ArrayBuffer | null | undefined = null;

  ngOnInit(): void {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    this.dataMinima = `${ano}-${mes}-${dia}`;

    this.formAtividade = this.fb.group({
      nome: ['', Validators.required],
      tipo: ['', Validators.required],
      vagas: [null, [Validators.required, Validators.min(1)]],
      data: ['', Validators.required],
      horarioInicio: ['', Validators.required],
      horarioFim: ['', Validators.required],
      local: ['', Validators.required],
      descricao: [''],
    });

    this.carregarAtividades();
  }

  get f() {
    return this.formAtividade.controls;
  }

  carregarAtividades() {
    this.atividadeService.listarTodas().subscribe({
      next: (res) => {
        // 🔥 REMOVIDA AQUELA LÓGICA DO FOREACH (O CURATIVO)
        this.atividadesCadastradas = res.content || [];
        this.timestampImagem = Date.now();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao buscar atividades', err),
    });
  }

  obterUrlImagem(imagem: string | null | undefined): string {
    if (!imagem) return '';
    if (imagem.startsWith('http')) return imagem;
    return encodeURI(`http://localhost:8080/uploads/${imagem}?t=${this.timestampImagem}`);
  }

  // ==========================================
  // LÓGICA DE OCULTAR / RESTAURAR
  // ==========================================
  alternarVisibilidade(ativ: any) {
    if (ativ.ativo) {
      this.atividadeService.excluir(ativ.idAtividade).subscribe({
        next: () => {
          ativ.ativo = false;
          this.cdr.detectChanges();
        },
        error: () => alert('Erro ao ocultar a atividade.'),
      });
    } else {
      this.atividadeService.restaurar(ativ.idAtividade).subscribe({
        next: () => {
          ativ.ativo = true;
          this.cdr.detectChanges();
        },
        error: () => alert('Erro ao restaurar a atividade.'),
      });
    }
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
      descricao: [ativ.descricao],
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

      reader.onload = (e) => {
        this.imagemPreviewEdicao = e.target?.result;
        this.cdr.detectChanges();
      };

      reader.readAsDataURL(file);
    }
  }

  salvarEdicao() {
    if (this.formEdicao.invalid) return;

    this.salvando = true;
    const payload = this.formEdicao.value;

    const ativAntiga = this.atividadesCadastradas.find(
      (a) => a.idAtividade === payload.idAtividade,
    );
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
        },
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
        alert(
          'Erro ao atualizar atividade. Verifique os dados (A data não pode estar no passado).',
        );
        this.salvando = false;
      },
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

  aoArrastarSobre(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }
  aoSairArrastar(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }
  aoSoltarArquivo(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0)
      this.processarArquivo(event.dataTransfer.files[0]);
  }
  aoSelecionarArquivo(event: any) {
    if (event.target.files && event.target.files.length > 0)
      this.processarArquivo(event.target.files[0]);
  }

  processarArquivo(file: File) {
    if (!file.type.startsWith('image/')) return;
    this.arquivoImagem = file;
    const reader = new FileReader();

    reader.onload = (e) => {
      this.imagemPreview = e.target?.result;
      this.cdr.detectChanges();
    };

    reader.readAsDataURL(file);
  }

  removerImagem(event: Event) {
    event.stopPropagation();
    this.arquivoImagem = null;
    this.imagemPreview = null;
  }

  salvarAtividade() {
    if (this.formAtividade.invalid) {
      this.formAtividade.markAllAsTouched();
      return;
    }
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
      imagem: '',
    };

    if (this.arquivoImagem) {
      this.atividadeService.uploadImagem(this.arquivoImagem).subscribe({
        next: (res) => {
          payload.imagem = res.url;
          this.enviarPayloadFinal(payload);
        },
        error: () => {
          alert('Erro ao enviar a imagem.');
          this.salvando = false;
        },
      });
    } else {
      this.enviarPayloadFinal(payload);
    }
  }

  private enviarPayloadFinal(payload: any) {
    this.atividadeService.cadastrar(payload).subscribe({
      next: () => {
        this.fecharModalNovaAtividade();
        this.carregarAtividades();
      },
      error: (err) => {
        alert(
          'Erro ao cadastrar a atividade. Verifique os dados (A data não pode estar no passado).',
        );
        this.salvando = false;
      },
    });
  }
}
