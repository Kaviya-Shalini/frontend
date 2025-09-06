import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-find-username',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './find-username.html',
  styleUrl: './find-username.css',
})
export class ForgotUsernameComponent {
  email = '';
  error = '';
  loading = false;

  constructor(private http: HttpClient, private router: Router) {}

  submit() {
    if (!this.email.trim()) {
      this.error = 'Email is required';
      return;
    }

    this.error = '';
    this.loading = true;

    this.http
      .post('http://localhost:8080/api/auth/user-utils/find-username', { email: this.email })
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          alert(`Your username has been sent to: ${this.email}`);
          this.router.navigateByUrl('/login');
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.error?.message || 'Failed to send username';
        },
      });
  }
}
