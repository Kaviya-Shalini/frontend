import { HttpClientModule } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule],
  styleUrl: './app.css',
  template: `
    <div class="container">
      <div class="grid">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  providers: [CookieService], // ✅ only this
})
export class App {
  protected readonly title = signal('frontend');

  constructor(private cookieService: CookieService) {}
}
