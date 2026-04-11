import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
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
