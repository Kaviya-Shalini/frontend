import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-otpforpassword',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './otpforpassword.html',
  styleUrl: './otpforpassword.css',
})
export class otpforpasswordreset {
  otp = '';
  error = '';

  constructor(private http: HttpClient, private router: Router) {}
  verify() {
    this.http.post('http://localhost:8080/api/auth/user-utils/reset', { otp: this.otp }).subscribe({
      next: () => {
        this.router.navigateByUrl('/confirmpassword'); // go to reset password page
      },
      error: (err) => (this.error = err?.error?.message || 'OTP verification failed'),
    });
  }
}
