import {
  Component,
  OnInit,
  HostListener,
  ViewChild,
  ViewChildren,
  QueryList,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRoute, Router } from '@angular/router';

interface FileData {
  id: number;
  filename: string;
  description: string;
  category: string;
  createdAt: Date;
}

interface FilesResponse {
  fetchFiles: FileData[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  lastPage: boolean;
}

@Component({
  selector: 'app-mywallet',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, SidebarComponent],

  templateUrl: './mywallet.html',
  styleUrl: './mywallet.css',
})
export class MyWalletComponent implements OnInit, AfterViewInit {
  files: FileData[] = [];
  selectedCard: FileData | null = null;
  isSidebarClosed = false;
  searchQuery: string = '';
  highlightFileName: string | null = null;
  @ViewChild(SidebarComponent) sidebar!: SidebarComponent;
  @ViewChildren('cardEl') cardElements!: QueryList<ElementRef>;

  // 0-based index for API
  currentPage = 0;
  totalPages = 0;
  pageSize = 6;
  totalElements = 0;
  // Track which card is showing download options
  downloadOptionsFor: number | null = null;
  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private cookieService: CookieService
  ) {}
  // Guide State for MyWallet Page
  showGuide = false; // starts hidden
  currentStep = 0;

  steps = [
    {
      title: '📦 MyWallet Overview',
      text: 'This page contains all your uploaded files displayed as cards. Each card shows the file name, description, and category.',
    },
    {
      title: '⬇ Download',
      text: 'Click the "Download" button on a file card to securely download your decrypted file.',
    },
    {
      title: '📤 Share',
      text: 'Click "Share" to go to the share page. Enter a valid recipient username (they must be registered). You will also choose a filter (List1 or List2). Once shared, you will see a confirmation message.',
    },
    {
      title: '🗑 Delete',
      text: 'Click "Delete" to go to the delete page. You can delete for everyone, only for yourself, or for selected users.',
    },
    {
      title: '🔍 Search',
      text: 'Use the search bar to find your files quickly by name, description, or category.',
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

  ngOnInit() {
    this.checkScreenSize();

    this.route.queryParams.subscribe((params) => {
      if (params['fileName']) {
        this.highlightFileName = params['fileName'];
      }
    });

    this.loadPage();
  }

  ngAfterViewInit() {
    this.adjustCardHeights();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
    this.adjustCardHeights();
  }

  checkScreenSize() {
    this.isSidebarClosed = window.innerWidth <= 992;
  }

  onSidebarToggle(state: boolean) {
    this.isSidebarClosed = state;
  }

  toggleSidebar() {
    if (this.sidebar) this.sidebar.toggleSidebar();
  }

  /** Load files with pagination */
  loadPage() {
    this.http
      .get<FilesResponse>(
        `http://localhost:8080/api/auth/files/fetch-all?pageNumber=${
          this.currentPage + 1
        }&pageSize=${this.pageSize}`,
        { withCredentials: true }
      )
      .subscribe({
        next: (res) => {
          this.files = res.fetchFiles;
          this.totalPages = res.totalPages;
          this.totalElements = res.totalElements;

          setTimeout(() => {
            this.adjustCardHeights();

            // ✅ Run highlight only if it's the first time
            if (this.highlightFileName !== null) {
              this.checkAndHighlightFile();
            }
          }, 0);
        },
        error: (err) => console.error('Failed to load files', err),
      });
  }

  checkAndHighlightFile() {
    const file = this.files.find((f) => f.filename === this.highlightFileName);
    if (file) {
      const fileId = file.id;
      this.highlightFileName = null; // ✅ Reset immediately after finding it
      this.scrollToFile(fileId);
    } else if (this.currentPage + 1 < this.totalPages) {
      this.currentPage++;
      this.loadPage();
    } else {
      this.searchQuery = this.highlightFileName!;
      this.highlightFileName = null; // ✅ Reset here too
      this.searchAndHighlight();
    }
  }

  searchAndHighlight() {
    this.http
      .get<FilesResponse>(
        `http://localhost:8080/api/auth/files/fetch-all?keyword=${encodeURIComponent(
          this.highlightFileName!
        )}&pageNumber=1&pageSize=${this.pageSize}`,
        { withCredentials: true }
      )
      .subscribe({
        next: (res) => {
          this.files = res.fetchFiles;
          this.totalPages = res.totalPages;
          this.totalElements = res.totalElements;

          setTimeout(() => {
            const file = this.files.find((f) => f.filename === this.highlightFileName);
            if (file) this.scrollToFile(file.id);
          }, 0);
        },
        error: (err) => console.error('Search failed', err),
      });
  }
  scrollToFile(fileId: number) {
    const attemptScroll = () => {
      const element = document.getElementById('file-' + fileId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('highlight');

        setTimeout(() => {
          element.classList.remove('highlight');
        }, 5000);
      } else {
        setTimeout(attemptScroll, 200);
      }
    };
    attemptScroll();
  }

  /** Search with pagination */
  searchFilesWithPagination() {
    if (!this.searchQuery.trim()) {
      this.currentPage = 0;
      this.loadPage();
      return;
    }
    this.http
      .get<FilesResponse>(
        `http://localhost:8080/api/auth/files/fetch-all?keyword=${encodeURIComponent(
          this.searchQuery
        )}&pageNumber=${this.currentPage + 1}&pageSize=${this.pageSize}`,
        { withCredentials: true }
      )
      .subscribe({
        next: (res) => {
          this.files = res.fetchFiles;
          this.totalPages = res.totalPages;
          this.totalElements = res.totalElements;
          setTimeout(() => this.adjustCardHeights(), 0);
        },
        error: (err) => console.error('Search failed', err),
      });
  }

  /** Build page range with "..." */
  paginationRange(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage + 1; // convert to 1-based for display
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
      if (l) {
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

  /** Template-safe helpers to avoid arithmetic on string '...' */
  isActivePage(page: number | string): boolean {
    return typeof page === 'number' ? page - 1 === this.currentPage : false;
  }

  onPageClick(page: number | string) {
    if (typeof page === 'number') {
      this.goToPage(page - 1); // convert to 0-based
    }
  }

  /** Pagination controls */
  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.searchQuery.trim() ? this.searchFilesWithPagination() : this.loadPage();
    }
  }

  nextPage() {
    if (this.currentPage + 1 < this.totalPages) {
      this.currentPage++;
      this.searchQuery.trim() ? this.searchFilesWithPagination() : this.loadPage();
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.searchQuery.trim() ? this.searchFilesWithPagination() : this.loadPage();
    }
  }

  /** File actions */
  toggleDownloadOptions(file: FileData, event: MouseEvent) {
    event.stopPropagation();
    this.downloadOptionsFor = this.downloadOptionsFor === file.id ? null : file.id;
  }

  downloadDecrypted(file: FileData, event: MouseEvent) {
    event.stopPropagation();
    this.http
      .get(`http://localhost:8080/api/auth/files/download/${file.id}`, {
        responseType: 'blob',
        withCredentials: true,
      })
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = file.filename;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (err) => console.error('Download (decrypted) failed', err),
      });
  }

  downloadEncrypted(file: FileData, event: MouseEvent) {
    event.stopPropagation();
    this.http
      .get(`http://localhost:8080/api/auth/files/download/encrypted/${file.id}`, {
        responseType: 'blob',
        withCredentials: true,
      })
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = file.filename + '.enc';
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (err) => console.error('Download (encrypted) failed', err),
      });
  }

  shareFile(file: FileData, event: MouseEvent) {
    event.stopPropagation();
    this.router.navigate(['/share', file.id]);
  }

  // In MyWalletComponent
  deleteFile(file: FileData, event: MouseEvent) {
    event.stopPropagation();
    this.router.navigate(['/delete', file.id]); // 👈 go to the new delete page
  }

  selectCard(file: FileData) {
    this.selectedCard = this.selectedCard?.id === file.id ? null : file;
  }

  private adjustCardHeights() {
    if (!this.cardElements || this.cardElements.length === 0) return;
    this.cardElements.forEach((card) => (card.nativeElement.style.height = 'auto'));
    let maxHeight = 0;
    this.cardElements.forEach((card) => {
      const height = card.nativeElement.offsetHeight;
      if (height > maxHeight) maxHeight = height;
    });
    this.cardElements.forEach((card) => (card.nativeElement.style.height = maxHeight + 'px'));
  }
}
