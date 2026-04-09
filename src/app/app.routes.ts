import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

import { Inicial } from './pages/inicial/inicial';
import { CentralUsuario } from './pages/central-usuario/central-usuario';
import { ConfiguracaoAtividade } from './pages/configuracao-atividade/configuracao-atividade';
import { GerenciamentoAtividade } from './pages/gerenciamento-atividade/gerenciamento-atividade';
import { RelatorioAtividade } from './pages/relatorio-atividade/relatorio-atividade';

export const routes: Routes = [
  // ABERTA: Página de Login/Inicial
  { path: '', component: Inicial },

  // PROTEGIDAS: Só logados entram
  {
    path: 'central-usuario',
    component: CentralUsuario,
    canActivate: [authGuard]
  },
  {
    path: 'agendamento',
    component: GerenciamentoAtividade,
    canActivate: [authGuard]
  },
  {
    path: 'relatorios',
    component: RelatorioAtividade,
    canActivate: [authGuard]
  },

  // RESTRITA: Só Administrador entra
  {
    path: 'configuracao',
    component: ConfiguracaoAtividade,
    canActivate: [authGuard, adminGuard]
  },

  { path: '**', redirectTo: '', pathMatch: 'full' }
];
