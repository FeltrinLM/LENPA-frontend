import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RelatorioService } from '../../core/services/api/relatorio.service';

// IMPORTANDO O COMPONENTE PADRÃO DE BOTÕES
import { BotaoPadraoComponent } from '../../shared/components/botao-padrao/botao-padrao.component';

@Component({
  selector: 'app-relatorio-atividade',
  standalone: true,
  // ADICIONADO AQUI
  imports: [CommonModule, FormsModule, BotaoPadraoComponent],
  templateUrl: './relatorio-atividade.html',
  styleUrls: ['./relatorio-atividade.css']
})
export class RelatorioAtividade {
  dataInicio: string = '';
  dataFim: string = '';

  relatorioGerado: boolean = false;
  carregando: boolean = false;

  totalVisitantesGeral: number = 0;
  eventosRealizados: any[] = [];
  dadosCidades: any[] = [];
  estiloGraficoPizza: string = '';

  private relatorioService = inject(RelatorioService);
  private cdr = inject(ChangeDetectorRef);

  // A sua paleta base exata
  private coresBase = ['#006334', '#A6CD29', '#02A34D', '#F0A400', '#074168'];

  get datasInvalidas(): boolean {
    if (!this.dataInicio || !this.dataFim) return false;
    return new Date(this.dataInicio) > new Date(this.dataFim);
  }

  // ALGORITMO DE CORES INFINITAS (HEX para HSL)
  private gerarCorEscalonavel(index: number): string {
    const corHex = this.coresBase[index % this.coresBase.length];
    const ciclo = Math.floor(index / this.coresBase.length);

    // Converte HEX para RGB
    let hex = corHex.replace(/^#/, '');
    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;

    // Converte RGB para HSL
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    // Modifica a luminosidade com base no ciclo (Escurece 12% a cada volta)
    let ajuste = ciclo * 12;
    l = l - ajuste;

    // Proteção: Se a cor ficar muito próxima do preto, clareamos ao invés de escurecer
    if (l < 15) {
      l = l + 40;
    }

    return `hsl(${h}, ${s}%, ${l}%)`;
  }

  gerarRelatorio() {
    if (!this.dataInicio || !this.dataFim) return;
    if (this.datasInvalidas) return;

    this.carregando = true;

    this.relatorioService.gerarRelatorioGeral(this.dataInicio, this.dataFim).subscribe({
      next: (res: any) => {
        this.totalVisitantesGeral = res.totalVisitantesGeral || 0;

        this.eventosRealizados = (res.eventosRealizados || []).map((evento: any) => {
          let urlImagem = evento.imagem;
          if (urlImagem && !urlImagem.startsWith('http') && !urlImagem.startsWith('assets')) {
            urlImagem = 'http://localhost:8080/uploads/' + urlImagem;
          }
          return {
            nome: evento.nome,
            visitantes: evento.visitantes,
            imagem: urlImagem || '/assets/images/placeholder_background.jpg'
          };
        });

        // Agora injetando a função de cor escalonável
        this.dadosCidades = (res.dadosCidades || []).map((cidade: any, index: number) => {
          let porcentagemCalculada = 0;
          if (this.totalVisitantesGeral > 0) {
            porcentagemCalculada = (cidade.total / this.totalVisitantesGeral) * 100;
          }
          return {
            localidade: cidade.localidade,
            visitantesAbsolutos: cidade.total,
            porcentagem: porcentagemCalculada,
            cor: this.gerarCorEscalonavel(index) // <-- MÁGICA APLICADA AQUI
          };
        });

        this.montarGraficoPizza();
        this.relatorioGerado = true;
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erro ao gerar relatório:', err);
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  montarGraficoPizza() {
    let gradientStops: string[] = [];
    let acumulado = 0;

    this.dadosCidades.forEach(dado => {
      let inicio = acumulado;
      let fim = acumulado + dado.porcentagem;
      gradientStops.push(`${dado.cor} ${inicio}% ${fim}%`);
      acumulado = fim;
    });

    this.estiloGraficoPizza = `conic-gradient(${gradientStops.join(', ')})`;
  }
}
