import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-relatorio-atividade',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './relatorio-atividade.html',
  styleUrl: './relatorio-atividade.css'
})
export class RelatorioAtividade {
  dataInicio: string = '';
  dataFim: string = '';

  // SAFEGUARD: Essa função verifica em tempo real se a data inicial é maior que a final
  get datasInvalidas(): boolean {
    if (!this.dataInicio || !this.dataFim) return false;
    return new Date(this.dataInicio) > new Date(this.dataFim);
  }

  // 🔴 INTEGRAÇÃO API: Disparado ao clicar no botão
  gerarRelatorio() {
    if (!this.dataInicio || !this.dataFim) {
      alert("Por favor, preencha as duas datas!");
      return;
    }

    // Trava extra de segurança antes de chamar a API
    if (this.datasInvalidas) {
      alert("A data inicial não pode ser maior que a data final!");
      return;
    }

    // 🔴 INTEGRAÇÃO API: Aqui você fará um GET passando as datas como parâmetro.
    // Ex: this.http.get(`/api/relatorios?de=${this.dataInicio}&ate=${this.dataFim}`)
    console.log(`Buscando no banco os relatórios de ${this.dataInicio} até ${this.dataFim}`);
    alert(`Gerando relatório de ${this.dataInicio} até ${this.dataFim}...`);
  }
}
