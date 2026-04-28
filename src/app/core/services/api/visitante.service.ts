import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VisitanteService {
  private http = inject(HttpClient);

  private readonly BASE_URL = 'http://localhost:8080/visitantes';

  // NOVO: Busca o visitante pelo e-mail (usado no autocompletar do site)
  buscarPorEmail(email: string): Observable<any> {
    // Monta a URL: http://localhost:8080/visitantes/buscar-email?email=joao@teste.com
    const params = new HttpParams().set('email', email);
    return this.http.get(`${this.BASE_URL}/buscar-email`, { params });
  }

  // NOVO: Busca parcial pelo nome (usado no autocompletar do funcionário futuramente)
  buscarPorNome(nome: string): Observable<any[]> {
    const params = new HttpParams().set('nome', nome);
    return this.http.get<any[]>(`${this.BASE_URL}/buscar-nome`, { params });
  }

  cadastrar(payload: any): Observable<any> {
    return this.http.post(this.BASE_URL, payload);
  }

  listar(): Observable<any> {
    return this.http.get(this.BASE_URL);
  }

  excluir(id: number): Observable<any> {
    return this.http.delete(`${this.BASE_URL}/${id}`);
  }

  atualizar(payload: any): Observable<any> {
    return this.http.put(this.BASE_URL, payload);
  }
}
