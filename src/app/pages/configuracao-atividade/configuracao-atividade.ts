import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AtividadeService } from '../../core/services/api/atividade.service';

@Component({
  selector: 'app-configuracao-atividade',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracao-atividade.html',
  styleUrl: './configuracao-atividade.css'
})
export class ConfiguracaoAtividade implements OnInit {

  private router = inject(Router);
  // 1. Injetando o service que vai falar com o Java
  private atividadeService = inject(AtividadeService);

  isDragging = false;
  salvando = false; // Controle para evitar que o usuário clique 2x enquanto carrega

  modalNovaAtividade = {
    exibir: false,
    nome: '',
    data: '',
    horarioInicio: '',
    horarioFim: '',
    tipo: '',
    vagas: null,
    descricao: '',
    arquivoImagem: null as File | null,
    imagemPreview: null as string | ArrayBuffer | null | undefined
  };

  ngOnInit(): void {}

  abrirModalNovaAtividade() {
    this.modalNovaAtividade = {
      exibir: true,
      nome: '',
      data: '',
      horarioInicio: '',
      horarioFim: '',
      tipo: '',
      vagas: null,
      descricao: '',
      arquivoImagem: null,
      imagemPreview: null
    };
  }

  fecharModalNovaAtividade() {
    this.modalNovaAtividade.exibir = false;
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

    this.modalNovaAtividade.arquivoImagem = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.modalNovaAtividade.imagemPreview = e.target?.result;
    };
    reader.readAsDataURL(file);
  }

  removerImagem(event: Event) {
    event.stopPropagation();
    this.modalNovaAtividade.arquivoImagem = null;
    this.modalNovaAtividade.imagemPreview = null;
  }

  // ==========================================
  // SALVAR NO BACKEND
  // ==========================================
  salvarAtividade() {
    if (!this.modalNovaAtividade.nome || !this.modalNovaAtividade.tipo || !this.modalNovaAtividade.data) {
      alert('Preencha os campos obrigatórios (Nome, Data e Tipo).');
      return;
    }

    this.salvando = true;
    const horarioFormatado = `${this.modalNovaAtividade.horarioInicio} às ${this.modalNovaAtividade.horarioFim}`;

    const payload = {
      nome: this.modalNovaAtividade.nome,
      data: this.modalNovaAtividade.data,
      horario: horarioFormatado,
      tipo: this.modalNovaAtividade.tipo,
      vagas: this.modalNovaAtividade.vagas,
      descricao: this.modalNovaAtividade.descricao,
      imagem: '' // Começa vazio, vamos preencher com a URL que o Java vai devolver
    };

    // 2. Se o usuário arrastou uma imagem, envia pro /upload primeiro
    if (this.modalNovaAtividade.arquivoImagem) {
      this.atividadeService.uploadImagem(this.modalNovaAtividade.arquivoImagem).subscribe({
        next: (response) => {
          // Pega a URL do Java e joga no payload
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
      // 3. Se não tem imagem, só cadastra direto
      this.enviarPayloadFinal(payload);
    }
  }

  // 4. Função auxiliar que atira o JSON inteiro pro Java
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
