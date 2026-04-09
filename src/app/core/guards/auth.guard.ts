import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true; // Token existe, pode passar
  }

  // Não está logado? Tenta acessar a URL na mão?
  // Redireciona para a home (página de login)
  router.navigate(['/']);
  return false;
};
