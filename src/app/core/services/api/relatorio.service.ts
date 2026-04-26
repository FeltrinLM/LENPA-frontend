import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RelatorioService {
  private http = inject(HttpClient);

  // Confirme se a porta é a 8080 mesmo
  private readonly BASE_URL = 'http://localhost:8080/relatorios';

  /**
   * Busca o relatório geral do banco de dados baseado no período.
   * As datas devem vir no formato 'YYYY-MM-DD'.
   */
  gerarRelatorioGeral(dataInicio: string, dataFim: string): Observable<any> {

    // O HttpParams monta automaticamente a URL assim:
    // http://localhost:8080/relatorios/geral?dataInicio=2026-04-01&dataFim=2026-04-30
    const params = new HttpParams()
      .set('dataInicio', dataInicio)
      .set('dataFim', dataFim);

    return this.http.get(`${this.BASE_URL}/geral`, { params });
  }
}
