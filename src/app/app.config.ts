import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

// 1. Importações do HTTP (agora com o withInterceptors)
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

// 2. Importação do nosso porteiro (Ajuste o caminho se sua pasta for diferente)
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),

    // 3. O provedor ÚNICO chamando o fetch e o interceptor ao mesmo tempo
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    )
  ],
};
