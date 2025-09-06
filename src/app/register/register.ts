import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  otp = '';
  otpRequested = false;
  otpVerified = false;
  loading = false;

  error = '';
  message = '';

  constructor(private http: HttpClient, private router: Router) {}

  generateOtp() {
    this.error = '';
    this.message = '';
    if (!this.email) {
      this.error = 'Please enter a valid email';
      return;
    }
    this.loading = true;
    this.http.post('http://localhost:8080/api/auth/otp/send', { email: this.email }).subscribe({
      next: () => {
        this.loading = false;
        this.otpRequested = true;
        this.message = 'OTP sent to your email.';
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Failed to generate OTP';
      },
    });
  }

  verifyOtp() {
    this.error = '';
    this.message = '';
    if (!this.email || !this.otp) {
      this.error = 'Enter both email and OTP';
      return;
    }
    this.loading = true;
    this.http
      .post('http://localhost:8080/api/auth/otp/verify', { email: this.email, otp: this.otp })
      .subscribe({
        next: () => {
          this.loading = false;
          this.otpVerified = true;
          this.message = 'OTP verified successfully!';
          this.otpRequested = false;
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.error?.message || 'OTP verification failed';
        },
      });
  }

  createAccount() {
    this.error = '';
    this.message = '';
    if (!this.name || !this.password) {
      this.error = 'Name and password are required';
      return;
    }
    this.loading = true;
    this.http
      .post('http://localhost:8080/api/auth/authenticate/signup', {
        username: this.name,
        email: this.email,
        password: this.password,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.message = 'Account created successfully!';
          setTimeout(() => this.router.navigateByUrl('/'), 1500);
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.error?.message || 'Registration failed';
        },
      });
  }
}
