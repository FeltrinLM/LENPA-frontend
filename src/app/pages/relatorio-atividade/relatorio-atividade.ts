import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-relatorio-atividade',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './relatorio-atividade.html',
  styleUrls: ['./relatorio-atividade.css']
})
export class RelatorioAtividade {
  dataInicio: string = '';
  dataFim: string = '';

  relatorioGerado: boolean = false;

  totalVisitantesGeral: number = 0;
  eventosRealizados: any[] = [];
  dadosCidades: any[] = [];
  estiloGraficoPizza: string = '';

  get datasInvalidas(): boolean {
    if (!this.dataInicio || !this.dataFim) return false;
    return new Date(this.dataInicio) > new Date(this.dataFim);
  }

  gerarRelatorio() {
    if (!this.dataInicio || !this.dataFim) {
      alert("Por favor, preencha as duas datas!");
      return;
    }

    if (this.datasInvalidas) {
      alert("A data inicial não pode ser maior que a data final!");
      return;
    }

    this.totalVisitantesGeral = 1200;

    // Apontando para as imagens reais da sua pasta assets
    this.eventosRealizados = [
      { nome: 'Exposição de espécies de abelhas nativas', visitantes: 600, imagem: 'assets/images/placeholders/abelhas.jpg' },
      { nome: 'Exposição de flores originárias do RS', visitantes: 600, imagem: 'assets/images/placeholders/flores.JPG' }
    ];

    // Top 10 cidades, bem mais limpo e direto ao ponto
    this.dadosCidades = [
      { localidade: 'Santa Maria', porcentagem: 40, cor: '#005A32' },
      { localidade: 'Porto Alegre', porcentagem: 15, cor: '#007A45' },
      { localidade: 'Passo Fundo', porcentagem: 10, cor: '#009E5A' },
      { localidade: 'Pelotas', porcentagem: 8, cor: '#22C55E' },
      { localidade: 'Caxias do Sul', porcentagem: 7, cor: '#F0A400' },
      { localidade: 'Santa Cruz do Sul', porcentagem: 5, cor: '#F5B833' },
      { localidade: 'Ijuí', porcentagem: 5, cor: '#FAD266' },
      { localidade: 'Cruz Alta', porcentagem: 4, cor: '#1E3A8A' },
      { localidade: 'São Gabriel', porcentagem: 3, cor: '#2563EB' },
      { localidade: 'Cachoeira do Sul', porcentagem: 3, cor: '#60A5FA' }
    ];

    this.montarGraficoPizza();
    this.relatorioGerado = true;
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
