import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { App } from './app/app';
import { routes } from './app/app.routes';
import { AuthInterceptor } from './app/services/auth.intercept';
import { CookieService } from 'ngx-cookie-service';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    CookieService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
}).catch((err) => console.error(err));
