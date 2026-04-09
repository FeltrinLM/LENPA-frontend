import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const usuario = authService.getDadosUsuario();

  if (usuario?.role === 'ADMINISTRADOR') {
    return true;
  }

  // Se for Bolsista tentando entrar na configuração, volta para a central
  router.navigate(['/central-usuario']);
  return false;
};
