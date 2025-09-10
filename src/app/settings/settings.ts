import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SidebarComponent } from '../sidebar/sidebar';
import { Router, RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-settings',
  imports: [CommonModule, FormsModule, HttpClientModule, SidebarComponent, RouterModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class SettingsComponent implements OnInit {
  constructor(private http: HttpClient, private router: Router) {}

  isSidebarClosed = false;

  user: { username: string; email: string } | null = null;
  helpline = '';

  open = { about: false, contact: false, delete: false, logout: false };
  loading = { user: false, contact: false };
  busy = { delete: false, logout: false };

  logoutOk = false;
  error: string | null = null;
  //Guide State for Settings Page
  showGuide = false;
  currentStep = 0;

  steps = [
    {
      title: '⚙ Settings Page',
      text: 'Here you can manage your personal account settings and important application options.',
    },
    {
      title: '👤 Account Information',
      text: 'You can view your registered username and email address that you used to sign up for this application.',
    },
    {
      title: '📞 Contact Support',
      text: "If you face issues, you can view the owner's contact information here for troubleshooting and support.",
    },
    {
      title: '🗑 Delete Account',
      text: 'If you choose to delete your account, all your files and related details will be permanently removed from the system.',
    },
    {
      title: '🚪 Logout',
      text: 'Click the logout button to securely sign out of your account.',
    },
  ];

  // Guide Controls
  openGuide() {
    this.showGuide = true;
    this.currentStep = 0;
  }
  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    } else {
      this.endGuide();
    }
  }
  prevStep() {
    if (this.currentStep > 0) this.currentStep--;
  }
  endGuide() {
    this.showGuide = false;
  }
  skipGuide() {
    this.showGuide = false;
  }

  ngOnInit(): void {}

  toggle(key: keyof typeof this.open) {
    this.open[key] = !this.open[key];
  }

  toggleAndFetch(key: 'about' | 'contact') {
    this.toggle(key);

    if (key === 'about' && this.open.about && !this.user && !this.loading.user) {
      this.loading.user = true;
      this.http
        .get<{ username: string; email: string }>(
          'http://localhost:8080/api/auth/user-utils/settings',
          {
            withCredentials: true,
          }
        )
        .subscribe({
          next: (res) => {
            this.user = res;
            this.loading.user = false;
          },
          error: () => {
            this.loading.user = false;
          },
        });
    }

    if (key === 'contact' && this.open.contact && !this.helpline && !this.loading.contact) {
      this.loading.contact = true;
      this.http.get<{ contact: string }>('/api/contact').subscribe({
        next: (res) => {
          this.helpline = res.contact;
          this.loading.contact = false;
        },
        error: () => {
          this.loading.contact = false;
        },
      });
    }
  }
  downloadKey(type: 'public' | 'private') {
    const endpoint =
      type === 'public'
        ? 'http://localhost:8080/api/auth/keys/download-public-key'
        : 'http://localhost:8080/api/auth/keys/download-private-key';

    this.http
      .get(endpoint, {
        responseType: 'blob',
        withCredentials: true,
      })
      .subscribe({
        next: (res) => {
          const blob = new Blob([res], { type: 'application/octet-stream' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = type === 'public' ? 'public_key.pem' : 'private_key.pem';
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: () => {
          alert(`Failed to download ${type} key ❌`);
        },
      });
  }

  onDeleteAccount() {
    this.busy.delete = true;

    this.http
      .delete('http://localhost:8080/api/auth/user-utils/delete-account', { withCredentials: true })
      .subscribe({
        next: () => {
          this.busy.delete = false;

          // Clear session
          localStorage.removeItem('username');
          document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

          // Redirect to login
          this.router.navigateByUrl('/');
        },
        error: () => {
          this.busy.delete = false;
          alert('Failed to delete account');
        },
      });
  }

  onLogout() {
    this.busy.logout = true;
    this.error = '';

    this.http
      .post('http://localhost:8080/api/auth/authenticate/signout', {}, { withCredentials: true })
      .subscribe({
        next: () => {
          localStorage.removeItem('username');
          document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          this.busy.logout = false;
          this.router.navigateByUrl('/');
        },
        error: (err) => {
          this.busy.logout = false;
          this.error = err?.error?.message || 'Logout failed';
        },
      });
  }
}
