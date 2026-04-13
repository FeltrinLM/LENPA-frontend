import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AtividadeService } from '../../core/services/api/atividade.service';

@Component({
  selector: 'app-configuracao-atividade',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './configuracao-atividade.html',
  styleUrl: './configuracao-atividade.css'
})
export class ConfiguracaoAtividade implements OnInit {

  private router = inject(Router);
  private atividadeService = inject(AtividadeService);
  private fb = inject(FormBuilder);

  // --- CONTROLES DA PÁGINA ---
  isDragging = false;
  salvando = false;
  exibirModal = false;

  // --- CONTROLES DE EXCLUSÃO ---
  exibirModalExclusao = false;
  atividadeParaExcluir: number | null = null;
  excluindo = false;

  // --- LISTA DE ATIVIDADES ---
  atividadesCadastradas: any[] = [];

  // --- FORMULÁRIO REATIVO ---
  formAtividade!: FormGroup;

  // --- CONTROLES DE IMAGEM ---
  arquivoImagem: File | null = null;
  imagemPreview: string | ArrayBuffer | null | undefined = null;

  ngOnInit(): void {
    this.formAtividade = this.fb.group({
      nome: ['', Validators.required],
      tipo: ['', Validators.required],
      vagas: [null, [Validators.required, Validators.min(1)]],
      data: ['', Validators.required],
      horarioInicio: ['', Validators.required],
      horarioFim: ['', Validators.required],
      descricao: ['']
    });

    this.carregarAtividades();
  }

  get f() { return this.formAtividade.controls; }

  carregarAtividades() {
    this.atividadeService.listar().subscribe({
      next: (res) => {
        this.atividadesCadastradas = res.content || [];
      },
      error: (err) => console.error('Erro ao buscar atividades', err)
    });
  }

  // ==========================================
  // CONTROLE DO MODAL DE NOVA ATIVIDADE
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

  // ==========================================
  // CONTROLE DO MODAL DE EXCLUSÃO
  // ==========================================
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
        alert('Atividade excluída com sucesso!');
        this.fecharModalExclusao();
        this.carregarAtividades(); // <-- Recarrega a grade sem a atividade!
        this.excluindo = false;
      },
      error: (err) => {
        console.error('Erro ao excluir:', err);
        alert('Erro ao excluir a atividade.');
        this.fecharModalExclusao();
        this.excluindo = false;
      }
    });
  }

  // ==========================================
  // LÓGICA DE DRAG & DROP DA IMAGEM
  // ==========================================
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
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.processarArquivo(event.dataTransfer.files[0]);
    }
  }

  aoSelecionarArquivo(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.processarArquivo(event.target.files[0]);
    }
  }

  processarArquivo(file: File) {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }
    this.arquivoImagem = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagemPreview = e.target?.result;
    };
    reader.readAsDataURL(file);
  }

  removerImagem(event: Event) {
    event.stopPropagation();
    this.arquivoImagem = null;
    this.imagemPreview = null;
  }

  // ==========================================
  // SALVAR NO BACKEND
  // ==========================================
  salvarAtividade() {
    if (this.formAtividade.invalid) {
      this.formAtividade.markAllAsTouched();
      return;
    }

    this.salvando = true;
    const formVals = this.formAtividade.value;
    const horarioFormatado = `${formVals.horarioInicio} às ${formVals.horarioFim}`;

    // Criamos o objeto base
    const payload = {
      nome: formVals.nome,
      data: formVals.data,
      horario: horarioFormatado,
      tipo: formVals.tipo,
      vagas: formVals.vagas,
      descricao: formVals.descricao,
      imagem: '' // String vazia inicial
    };

    if (this.arquivoImagem) {
      // Passo 1: Upload
      this.atividadeService.uploadImagem(this.arquivoImagem).subscribe({
        next: (response) => {
          // Aqui garantimos que enviamos apenas a STRING da URL
          payload.imagem = response.url;
          this.enviarPayloadFinal(payload);
        },
        error: (err) => {
          console.error('Erro no upload:', err);
          alert('Erro ao enviar a imagem.');
          this.salvando = false;
        }
      });
    } else {
      this.enviarPayloadFinal(payload);
    }
  }

  private enviarPayloadFinal(payload: any) {
    this.atividadeService.cadastrar(payload).subscribe({
      next: (res) => {
        alert('Atividade criada com sucesso!');
        this.fecharModalNovaAtividade();
        this.carregarAtividades();
      },
      error: (err) => {
        console.error('Erro no cadastro:', err);
        alert(err.error?.message || 'Erro ao cadastrar a atividade.');
        this.salvando = false;
      }
    });
  }
}
