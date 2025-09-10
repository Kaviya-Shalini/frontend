import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-verifyotp',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './verifyotp.html',
  styleUrl: './verifyotp.css',
})
export class VerifyOtpComponent {
  otp = '';
  error = '';
  username: string | null;

  constructor(private http: HttpClient, private router: Router) {
    this.username = localStorage.getItem('username'); // fetch username from login step
  }

  verify() {
    if (!this.otp.trim()) {
      this.error = 'OTP is required';
      return;
    }
    if (!this.username) {
      this.error = 'No username found in session. Please login again.';
      return;
    }
    this.http
      .post(
        'http://localhost:8080/api/auth/authenticate/verify-otp',
        {
          username: this.username,
          otp: this.otp,
        },
        { withCredentials: true }
      )
      .subscribe({
        next: (res: any) => {
          localStorage.setItem('otpVerified', 'true');
          this.router.navigateByUrl('/dashboard');
        },
        error: (err) => (this.error = err?.error?.message || 'OTP verification failed'),
      });
  }
}
