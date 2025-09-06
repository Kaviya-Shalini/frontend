import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-resetpassword',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './resetpassword.html',
  styleUrl: './resetpassword.css',
})
export class Resetpassword {
  otp = '';
  newPassword = '';
  confirmPassword = '';
  error = '';
  success = false;
  email: string | null = '';

  constructor(private http: HttpClient, private router: Router) {
    this.email = localStorage.getItem('resetEmail'); // ✅ email from forgot password
  }

  resetPassword() {
    if (!this.otp.trim() || !this.newPassword || !this.confirmPassword) {
      this.error = 'All fields are required';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }
    this.error = '';

    this.http
      .post('http://localhost:8080/api/auth/user-utils/reset', {
        email: this.email,
        otp: this.otp,
        newPassword: this.newPassword,
      })
      .subscribe({
        next: () => {
          this.success = true;
          setTimeout(() => this.router.navigateByUrl('/'), 2000);
        },
        error: (err) => (this.error = err?.error?.message || 'Failed to reset password'),
      });
  }
}
