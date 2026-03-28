import { Routes } from '@angular/router';

// Importando os componentes respeitando a pasta 'pages'
import { Inicial } from './pages/inicial/inicial';
import { CentralUsuario } from './pages/central-usuario/central-usuario';
import { ConfiguracaoAtividade } from './pages/configuracao-atividade/configuracao-atividade';
import { GerenciamentoAtividade } from './pages/gerenciamento-atividade/gerenciamento-atividade';
import { RelatorioAtividade } from './pages/relatorio-atividade/relatorio-atividade';

export const routes: Routes = [
  // Caminho vazio é a sua página inicial
  { path: '', component: Inicial },

  // Caminhos para as outras páginas
  { path: 'central-usuario', component: CentralUsuario },
  { path: 'agendamento', component: GerenciamentoAtividade },
  { path: 'relatorios', component: RelatorioAtividade },
  { path: 'configuracao', component: ConfiguracaoAtividade },

  // Rota coringa: se a URL não existir, volta pro início
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
