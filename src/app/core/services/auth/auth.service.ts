import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  private readonly API_URL = 'http://localhost:8080/auth';
  private readonly TOKEN_KEY = 'lenpa_token';

  constructor() { }

  login(credenciais: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credenciais).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem(this.TOKEN_KEY, response.token);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Pega o token salvo, decodifica e extrai o e-mail (subject)
   */
  getUsuarioLogado(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      // O JWT tem 3 partes separadas por ponto. O 'payload' é a segunda parte [1].
      const payload = token.split('.')[1];
      // atob() decodifica a base64. JSON.parse transforma em objeto JS.
      const decoded = JSON.parse(atob(payload));

      return decoded.sub; // O 'sub' é o email que o Spring Boot colocou lá!
    } catch (e) {
      console.error('Erro ao decodificar o token', e);
      return null;
    }
  }
}
