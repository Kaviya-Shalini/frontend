import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private cookieService: CookieService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Corrected the cookie name to 'jwt' to match your AuthService
    const token = this.cookieService.get('jwt');

    let cloned = req.clone({
      // Always include credentials to ensure the browser sends cookies
      withCredentials: true,
    });

    if (token) {
      // If a JWT token exists, manually add it to the Authorization header
      cloned = cloned.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }

    return next.handle(cloned);
  }
}
