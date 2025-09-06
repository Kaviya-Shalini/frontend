import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],

  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPasswordComponent {
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
      .post('http://localhost:8080/api/auth/user-utils/initiate', {
        email: this.email,
      })
      .subscribe({
        next: () => {
          localStorage.setItem('resetEmail', this.email); // save email for reset
          this.router.navigateByUrl('/confirmpassword');
          this.loading = false;
        },
        error: (err) => {
          this.error = err?.error?.message || 'Failed to send reset link. Try again.';
          this.loading = false;
        },
      });
  }
}
