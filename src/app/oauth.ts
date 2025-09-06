import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="card">
      <h2>Signing you in…</h2>
      <p>Please wait.</p>
    </section>
  `,
})
export class OAuthCallbackComponent {
  constructor(private router: Router) {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      this.router.navigateByUrl('/');
    } else {
      this.router.navigateByUrl('/');
    }
  }
}
