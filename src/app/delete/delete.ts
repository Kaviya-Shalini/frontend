import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SidebarComponent } from '../sidebar/sidebar';

interface PagedUsernamesResponse {
  usernames: string[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  lastPage: boolean;
}

@Component({
  selector: 'app-delete-file',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule, SidebarComponent],
  templateUrl: './delete.html',
  styleUrls: ['./delete.css'],
})
export class DeleteFileComponent implements OnInit, OnDestroy {
  fileId!: number;
  isSidebarClosed = false;

  // pagination state
  pageNumber = 1;
  pageSize = 8;
  totalPages = 0;
  totalElements = 0;
  lastPage = false;

  searchQuery: string = '';
  usernames: string[] = [];
  isLoading = false;
  errorMsg = '';
  successMessage: string | null = null;
  errorMessage: string | null = null;

  // localStorage selection key
  private lsKey = '';
  selected = new Set<string>();

  @ViewChild(SidebarComponent) sidebar!: SidebarComponent;

  // toast feedback
  toastMsg = '';
  toastType: 'success' | 'error' | 'info' | '' = '';

  get selectedArray(): string[] {
    return Array.from(this.selected);
  }

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.fileId = Number(idParam);
    this.lsKey = `deleteSelections:${this.fileId}`;
    this.restoreSelections();
    this.fetchRecipients();
  }

  ngOnDestroy(): void {
    this.saveSelections();
  }

  onSidebarToggle(state: boolean) {
    this.isSidebarClosed = state;
  }

  toggleSidebar() {
    if (this.sidebar) this.sidebar.toggleSidebar();
  }

  goBackToWallet() {
    this.router.navigate(['/mywallet']);
  }

  // -------- API calls --------
  fetchRecipients(): void {
    this.isLoading = true;
    this.errorMsg = '';
    this.http
      .get<PagedUsernamesResponse>(
        `http://localhost:8080/api/auth/shared-files/fetch-shared/${this.fileId}?pageNumber=${this.pageNumber}&pageSize=${this.pageSize}`,
        { withCredentials: true }
      )
      .subscribe({
        next: (res) => {
          this.usernames = res.usernames || [];
          this.pageNumber = res.pageNumber;
          this.pageSize = res.pageSize;
          this.totalPages = res.totalPages;
          this.totalElements = res.totalElements;
          this.lastPage = res.lastPage;
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMsg = err?.error?.error || 'Failed to load recipients.';
        },
      });
  }

  filteredUsernames(): string[] {
    if (!this.searchQuery.trim()) return this.usernames;
    return this.usernames.filter((u) => u.toLowerCase().includes(this.searchQuery.toLowerCase()));
  }

  // ✅ Delete for Me
  deleteForMe(): void {
    this.http
      .delete(`http://localhost:8080/api/auth/files/delete/${this.fileId}`, {
        withCredentials: true,
        body: { deletionType: 'me' },
      })
      .subscribe({
        next: () => {
          this.showToast('File deletion completed successfully ✅', 'success');
          setTimeout(() => this.router.navigate(['/mywallet']), 1500);
        },

        error: (err) =>
          (this.errorMessage =
            'Error deleting file for you ❌ ' + (err.error?.error || err.message)),
      });
  }

  // ✅ Delete for Everyone
  // ✅ Delete for Everyone
  deleteForEveryone(): void {
    this.http
      .delete(`http://localhost:8080/api/auth/files/delete/${this.fileId}`, {
        withCredentials: true,
        body: { deletionType: 'everyone' },
      })
      .subscribe({
        next: () => {
          this.showToast('File deletion completed successfully ✅', 'success');
          setTimeout(() => this.router.navigate(['/mywallet']), 1500);
        },
        error: (err) => {
          const backendMsg = err.error?.error || err.message;

          if (backendMsg.includes("Deletion type must be 'me'")) {
            // special case: file is shared copy
            this.showToast("❌ This is a shared file. You can only use 'Delete for Me'.", 'error');
          } else {
            // generic fallback
            this.errorMessage = 'Error deleting file for everyone ❌ ' + backendMsg;
          }
        },
      });
  }

  // ✅ Delete for Selected Users
  deleteForSelectedUsers(): void {
    const usernamesArray = Array.from(this.selected);

    if (usernamesArray.length === 0) {
      this.errorMessage = 'Please select at least one username.';
      return;
    }

    this.http
      .delete(`http://localhost:8080/api/auth/files/delete/${this.fileId}`, {
        withCredentials: true,
        body: {
          deletionType: 'list',
          recipientUsernames: usernamesArray,
        },
      })
      .subscribe({
        next: () => {
          this.showToast('File deletion completed successfully ✅', 'success');
          setTimeout(() => this.router.navigate(['/mywallet']), 1500);
        },
        error: (err) => {
          this.errorMessage =
            'Error deleting for selected users ❌ ' + (err.error?.error || err.message);
        },
      });
  }

  // -------- selection + localStorage --------
  toggle(username: string): void {
    if (this.selected.has(username)) {
      this.selected.delete(username);
    } else {
      this.selected.add(username);
    }
    this.saveSelections();
  }

  isChecked(username: string): boolean {
    return this.selected.has(username);
  }

  clearSelections(): void {
    this.selected.clear();
    localStorage.removeItem(this.lsKey);
  }

  removeChip(username: string): void {
    if (this.selected.delete(username)) {
      this.saveSelections();
    }
  }

  private saveSelections(): void {
    localStorage.setItem(this.lsKey, JSON.stringify(Array.from(this.selected)));
  }

  private restoreSelections(): void {
    const raw = localStorage.getItem(this.lsKey);
    if (raw) {
      try {
        const arr: string[] = JSON.parse(raw);
        this.selected = new Set(arr);
      } catch {}
    }
  }

  // -------- pagination helpers --------
  paginationRange(): (number | string)[] {
    const total = this.totalPages;
    const current = this.pageNumber;
    const delta = 2;
    const range: (number | string)[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l !== undefined) {
        if (Number(i) - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (Number(i) - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = Number(i);
    }
    return rangeWithDots;
  }

  isActivePage(page: number | string): boolean {
    return typeof page === 'number' ? page === this.pageNumber : false;
  }

  onPageClick(page: number | string) {
    if (typeof page === 'number') {
      this.goToPage(page);
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.pageNumber = page;
      this.fetchRecipients();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevPage() {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.fetchRecipients();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage() {
    if (this.pageNumber < this.totalPages) {
      this.pageNumber++;
      this.fetchRecipients();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // -------- toasts --------
  private showToast(msg: string, type: 'success' | 'error' | 'info'): void {
    this.toastMsg = msg;
    this.toastType = type;
    setTimeout(() => {
      this.toastMsg = '';
      this.toastType = '';
    }, 2500);
  }
}
