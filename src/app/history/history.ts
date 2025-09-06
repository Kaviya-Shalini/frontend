import { Component, OnInit, HostListener } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar';

interface AuditLogResponse {
  username: string;
  action: string;
  filename?: string;
  timestamp: string;
}

interface AuditLogsResponse {
  auditLogList: AuditLogResponse[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  lastPage: boolean;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, HttpClientModule, SidebarComponent],

  templateUrl: './history.html',
  styleUrl: './history.css',
})
export class HistoryComponent implements OnInit {
  isSidebarClosed = false;
  activities: AuditLogResponse[] = [];
  loading = true;
  error = '';

  // ✅ frontend uses 0-based indexing
  pageNumber = 0;
  pageSize = 5;
  totalPages = 0;
  totalElements = 0;
  lastPage = false;

  constructor(private http: HttpClient) {}
  // 🟢 Guide State for History Page
  showGuide = false;
  currentStep = 0;

  steps = [
    {
      title: '🕓 History Page',
      text: 'This page shows your activity logs, helping you track everything you have done inside the app.',
    },
    {
      title: '📂 File Actions',
      text: 'Logs include when you fetched files, uploaded files, shared files, or deleted files.',
    },
    {
      title: '🔑 Login & Logout',
      text: 'You can also see when you signed in and when you signed out, keeping your account usage transparent.',
    },
  ];
  clearAllLogs() {
    this.http
      .delete('http://localhost:8080/api/auth/logs/delete-all', {
        withCredentials: true,
        responseType: 'text', // 🔹 accept plain string instead of JSON
      })
      .subscribe({
        next: () => {
          this.activities = [];
          this.totalElements = 0;
          this.totalPages = 0;
          this.pageNumber = 0;
          this.lastPage = true;
          this.fetchActivities(); // refresh list
        },
        error: () => {
          this.error = 'Failed to clear logs ❌';
        },
      });
  }

  // 🟢 Guide Controls
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

  ngOnInit() {
    this.applyAutoClose();
    this.fetchActivities();
  }

  @HostListener('window:resize')
  onResize() {
    this.applyAutoClose();
  }

  applyAutoClose() {
    const shouldClose = window.innerWidth <= 992;
    if (this.isSidebarClosed !== shouldClose) {
      this.isSidebarClosed = shouldClose;
    }
  }

  onSidebarToggle(isClosed: boolean) {
    this.isSidebarClosed = isClosed;
  }

  fetchActivities() {
    this.loading = true;
    this.http
      .get<AuditLogsResponse>(
        `http://localhost:8080/api/auth/logs/my-logs?pageNumber=${this.pageNumber + 1}&pageSize=${
          this.pageSize
        }`,
        { withCredentials: true }
      )
      .subscribe({
        next: (response) => {
          this.activities = response.auditLogList;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.lastPage = response.lastPage;
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load activities. Please try again.';
          this.loading = false;
        },
      });
  }

  nextPage() {
    if (!this.lastPage) {
      this.pageNumber++;
      this.fetchActivities();
    }
  }

  prevPage() {
    if (this.pageNumber > 0) {
      this.pageNumber--;
      this.fetchActivities();
    }
  }
}
