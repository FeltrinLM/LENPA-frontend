import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AtividadeService {

  // Injetando apenas o HttpClient
  private http = inject(HttpClient);

  // Confirme se a sua porta do Spring Boot é essa mesma
  private BASE_URL = 'http://localhost:8080/atividades';

  // PASSO 1: Fazer o upload da imagem física
  uploadImagem(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('arquivo', file);

    // O Interceptor vai automaticamente interceptar esse POST e adicionar o Token!
    return this.http.post<{ url: string }>(`${this.BASE_URL}/upload`, formData);
  }

  // PASSO 2: Enviar o JSON com os dados da atividade
  cadastrar(payload: any): Observable<any> {
    // Mesma coisa aqui, envio limpo e o Interceptor cuida da segurança
    return this.http.post(this.BASE_URL, payload);
  }
}
