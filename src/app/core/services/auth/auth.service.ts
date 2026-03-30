import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap, catchError, throwError } from 'rxjs';

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
}

export interface UsuarioLogado {
  email: string;
  nome: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  private readonly API_URL = 'http://localhost:8080/auth';
  private readonly TOKEN_KEY = 'lenpa_token';

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  login(credenciais: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credenciais).pipe(
      tap(response => {
        if (response && response.token && this.isBrowser()) {
          localStorage.setItem(this.TOKEN_KEY, response.token);
        }
      }),
      catchError(err => {
        // Se der erro, o catchError garante que o erro chegue no componente para parar o "Aguarde"
        return throwError(() => err);
      })
    );
  }

  logout(): void {
    if (this.isBrowser()) localStorage.removeItem(this.TOKEN_KEY);
  }

  getToken(): string | null {
    return this.isBrowser() ? localStorage.getItem(this.TOKEN_KEY) : null;
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  getDadosUsuario(): UsuarioLogado | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');

      // Decodificação tratando UTF-8 (acentos)
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join(''));

      const decoded = JSON.parse(jsonPayload);
      console.log('Payload do JWT:', decoded);

      return {
        email: decoded.sub,
        nome: decoded.nome,
        role: decoded.role
      };
    } catch (e) {
      console.error('Erro ao decodificar token:', e);
      return null;
    }
  }
}
