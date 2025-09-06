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

  onShare(form: NgForm) {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.canSubmit()) {
      form.control.markAllAsTouched();
      return;
    }

    this.loading = true;

    const body = {
      recipientUsername: this.recipientUsername.trim(),
      fileId: this.fileId,
      isSensitive: this.isSensitive,
    };

    this.http.post<{ message?: string }>(this.apiUrl, body, { withCredentials: true }).subscribe({
      next: (res) => {
        this.successMessage = res?.message || 'File shared successfully ✅';
        this.errorMessage = '';
        // ✅ reset properly
        form.resetForm({
          recipientUsername: '',
          isSensitive: null,
        });
      },
      error: (err) => {
        this.errorMessage =
          err?.error?.message ||
          'Failed to share file ❌ because you are trying to share your received file only the owner of the file is allowed to share to multiple users';
        console.error('Share error:', err);
      },
      complete: () => {
        this.loading = false;
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
