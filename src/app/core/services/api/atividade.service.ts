import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AtividadeService {

  private http = inject(HttpClient);
  private BASE_URL = 'http://localhost:8080/atividades';

  // 1. UPLOAD DA IMAGEM
  uploadImagem(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('arquivo', file);
    return this.http.post<{ url: string }>(`${this.BASE_URL}/upload`, formData);
  }

  // 2. CADASTRO DA ATIVIDADE
  cadastrar(payload: any): Observable<any> {
    return this.http.post(this.BASE_URL, payload);
  }

  // 3. LISTAGEM
  listar(): Observable<any> {
    return this.http.get(this.BASE_URL);
  }

  // 4. EXCLUSÃO
  excluir(id: number): Observable<any> {
    return this.http.delete(`${this.BASE_URL}/${id}`);
  }
}
