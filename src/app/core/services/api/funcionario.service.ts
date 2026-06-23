import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FuncionarioService {
  private http = inject(HttpClient);

  private readonly BASE_URL = 'http://localhost:8080/funcionarios';

  listar(): Observable<any> {
    return this.http.get(this.BASE_URL);
  }

  atualizarPerfil(dados: { nome: string; email: string }): Observable<any> {
    return this.http.put(`${this.BASE_URL}/meu-perfil`, dados);
  }

  alterarSenha(dados: { senhaAtual: string; novaSenha: string }): Observable<any> {
    // A MÁGICA: Avisa o Angular para não tentar fazer parse de JSON de uma resposta vazia (204)
    return this.http.put(`${this.BASE_URL}/minha-senha`, dados, { responseType: 'text' });
  }

  cadastrar(payload: any): Observable<any> {
    return this.http.post(this.BASE_URL, payload);
  }

  excluir(id: number): Observable<any> {
    return this.http.delete(`${this.BASE_URL}/${id}`);
  }
}
