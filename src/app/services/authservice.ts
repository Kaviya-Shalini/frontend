// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth'; // your backend endpoint

  constructor(private http: HttpClient, private cookieService: CookieService) {}

  // Login API → saves JWT in cookies
  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials, { withCredentials: true });
  }

  // Save JWT in cookie (if backend doesn’t do it automatically)
  setToken(token: string): void {
    this.cookieService.set('jwt', token, { path: '/', secure: true, sameSite: 'Strict' });
  }

  // Get JWT from cookies
  getToken(): string | null {
    return this.cookieService.get('jwt') || null;
  }

  // Remove JWT from cookies
  logout(): void {
    this.cookieService.delete('jwt', '/');
  }

  // Check if logged in
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
