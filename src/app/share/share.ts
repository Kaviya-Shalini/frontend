import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { SidebarComponent } from '../sidebar/sidebar';

@Component({
  selector: 'app-share',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, SidebarComponent],
  templateUrl: './share.html',
  styleUrl: './share.css',
})
export class ShareComponent implements OnInit {
  isSidebarClosed = false;
  fileId: string | null = null;
  private apiUrl = 'http://localhost:8080/api/auth/shared-files/share';

  recipientUsername = '';
  isSensitive: boolean | null = null;

  successMessage = '';
  errorMessage = '';
  loading = false;

  hasJwt = false;

  @ViewChild('sidebar') sidebar!: SidebarComponent;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private cookieService: CookieService
  ) {}

  ngOnInit() {
    this.applyAutoClose();
    this.fileId = this.route.snapshot.paramMap.get('id');
    this.hasJwt = true; // browser manages cookies
  }

  @HostListener('window:resize')
  onResize() {
    this.applyAutoClose();
  }

  applyAutoClose() {
    this.isSidebarClosed = window.innerWidth <= 992;
  }

  onSidebarToggle(isClosed: boolean) {
    this.isSidebarClosed = isClosed;
  }

  toggleSidebar() {
    if (this.sidebar) this.sidebar.toggleSidebar();
  }

  canSubmit() {
    return this.fileId && this.recipientUsername.trim() && this.isSensitive !== null;
  }

  onShareFile() {
    if (!this.fileId || !this.recipientUsername) {
      this.errorMessage = 'Please provide recipient username.';
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';
    this.loading = true;

    const payload = {
      fileId: this.fileId,
      recipientUsername: this.recipientUsername,
    };

    this.http.post(this.apiUrl, payload, { responseType: 'text' }).subscribe({
      next: (response) => {
        this.successMessage = 'File shared successfully!';
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        if (err.error && typeof err.error === 'string') {
          // backend sends exception messages as response body
          if (err.error.includes('Recipient already has access')) {
            this.errorMessage = 'This user already has access to the file.';
          } else if (err.error.includes('User is not authorized to share')) {
            this.errorMessage = 'You are not allowed to share a received file.';
          } else {
            this.errorMessage = err.error;
          }
        } else {
          this.errorMessage = 'Something went wrong while sharing file.';
        }
      },
    });
  }

  goBack() {
    this.router.navigate(['/mywallet']);
  }

  viewShared() {
    this.router.navigate(['/sharedfiles']);
  }
}
