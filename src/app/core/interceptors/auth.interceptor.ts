import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  // 1. TRAVA DE SEGURANÇA: Se a requisição for para uma API externa (como o IBGE),
  // passa reto sem injetar o token. Isso evita o vazamento da credencial do usuário.
  if (req.url.includes('ibge.gov.br')) {
    return next(req);
  }

  // 2. Lógica padrão para a nossa própria API (LENPA)
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Se o usuário tem um token, clonamos a requisição original e injetamos o cabeçalho
  if (token) {
    const requisicaoClonada = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    // Manda a requisição modificada para frente
    return next(requisicaoClonada);
  }

  // Se não tem token (ex: tela de login), manda a requisição original mesmo
  return next(req);
};
