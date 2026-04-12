import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; // <-- Adicionado ReactiveFormsModule
import { Router } from '@angular/router';
import { AtividadeService } from '../../core/services/api/atividade.service';

@Component({
  selector: 'app-configuracao-atividade',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule], // <-- Importado aqui
  templateUrl: './configuracao-atividade.html',
  styleUrl: './configuracao-atividade.css'
})
export class ConfiguracaoAtividade implements OnInit {

  private router = inject(Router);
  private atividadeService = inject(AtividadeService);
  private fb = inject(FormBuilder); // <-- FormBuilder injetado

  // --- CONTROLES DA PÁGINA ---
  isDragging = false;
  salvando = false;
  exibirModal = false;

  // --- FORMULÁRIO REATIVO ---
  formAtividade!: FormGroup;

  // --- CONTROLES DE IMAGEM (Ficam fora do formGroup por ser arquivo) ---
  arquivoImagem: File | null = null;
  imagemPreview: string | ArrayBuffer | null | undefined = null;

  ngOnInit(): void {
    // Inicialização do formulário com as validações
    this.formAtividade = this.fb.group({
      nome: ['', Validators.required],
      tipo: ['', Validators.required],
      vagas: [null, [Validators.required, Validators.min(1)]],
      data: ['', Validators.required],
      horarioInicio: ['', Validators.required],
      horarioFim: ['', Validators.required],
      descricao: [''] // Descrição não é obrigatória
    });
  }

  // Atalho para o HTML acessar os erros mais facilmente
  get f() { return this.formAtividade.controls; }

  // ==========================================
  // CONTROLE DO MODAL
  // ==========================================
  abrirModalNovaAtividade() {
    this.exibirModal = true;
    this.formAtividade.reset();
    this.formAtividade.get('tipo')?.setValue(''); // Força o select a voltar pro placeholder
    this.arquivoImagem = null;
    this.imagemPreview = null;
  }

  fecharModalNovaAtividade() {
    this.exibirModal = false;
    this.salvando = false;
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
      alert('Por favor, selecione apenas arquivos de imagem (PNG, JPG, etc).');
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
    // 1. O formulário é válido? Se não for, mostra os erros vermelhos na tela
    if (this.formAtividade.invalid) {
      this.formAtividade.markAllAsTouched();
      return;
    }

    this.salvando = true;

    // Extrai os dados validados
    const formVals = this.formAtividade.value;
    const horarioFormatado = `${formVals.horarioInicio} às ${formVals.horarioFim}`;

    const payload = {
      nome: formVals.nome,
      data: formVals.data,
      horario: horarioFormatado,
      tipo: formVals.tipo,
      vagas: formVals.vagas,
      descricao: formVals.descricao,
      imagem: '' // Será preenchido com a URL
    };

    // 2. Se tem imagem, faz upload primeiro
    if (this.arquivoImagem) {
      this.atividadeService.uploadImagem(this.arquivoImagem).subscribe({
        next: (response) => {
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
      // 3. Se não tem imagem, manda direto
      this.enviarPayloadFinal(payload);
    }
  }

  // 4. Conclui o cadastro
  private enviarPayloadFinal(payload: any) {
    this.atividadeService.cadastrar(payload).subscribe({
      next: (res) => {
        alert('Atividade criada com sucesso!');
        this.fecharModalNovaAtividade();
      },
      error: (err) => {
        console.error('Erro no cadastro:', err);
        alert(err.error?.message || 'Erro ao cadastrar a atividade.');
        this.salvando = false;
      }
    });
  }
}
