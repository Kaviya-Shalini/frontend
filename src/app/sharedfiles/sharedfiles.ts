import {
  Component,
  OnInit,
  HostListener,
  ViewChildren,
  QueryList,
  ElementRef,
  AfterViewInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar';
import { PaginationService, PaginatedResponse } from '../services/pagination';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

interface SharedFile {
  id: number;
  senderName: string;
  recipientName: string;
  filename: string;
  category: string;
  isSensitive: boolean;
}

@Component({
  selector: 'app-sharedfiles',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, SidebarComponent],
  providers: [CookieService],
  templateUrl: './sharedfiles.html',
  styleUrl: './sharedfiles.css',
})
export class SharedFilesComponent implements OnInit, AfterViewInit {
  allFiles: SharedFile[] = [];
  filteredFiles: SharedFile[] = [];
  searchQuery: string = '';
  filterType: 'all' | 'sensitive' | 'insensitive' = 'all';
  isSidebarClosed = false;

  @ViewChildren('cardEl') cardElements!: QueryList<ElementRef>;
  @ViewChild(SidebarComponent) sidebar!: SidebarComponent;

  // Pagination
  currentPage = 0;
  totalPages = 0;
  pageSize = 6; // match backend
  totalElements = 0;

  constructor(
    private http: HttpClient,
    private router: Router,
    private paginationService: PaginationService,
    private cookieService: CookieService
  ) {}
  // Guide State for Shared Files Page
  showGuide = false;
  currentStep = 0;

  steps = [
    {
      title: '📤 Shared Files',
      text: 'This page lists all the files you have shared with other users. Each shared file is displayed as a card.',
    },
    {
      title: '📄 File Card Details',
      text: 'Each card shows the file name, recipient name, and the category of the file.',
    },
    {
      title: '🔍 Search & Filter',
      text: 'Use the search bar to quickly find shared files by filename, recipient name, or category. You can also filter files using List1 or List2.',
    },
    {
      title: '📦 Already in MyWallet',
      text: 'All shared files also exist in your MyWallet page. You can always manage (download, share again, or delete) them from there.',
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
    this.restoreFromCookies();
    this.fetchSharedFiles();
  }

  ngAfterViewInit() {
    this.adjustCardHeights();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
    this.adjustCardHeights();
    this.loadPage();
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

  // Fetch with Pagination
  fetchSharedFiles() {
    this.http
      .get<PaginatedResponse<SharedFile>>('http://localhost:8080/api/auth/shared-files/by-me', {
        params: {
          pageNumber: (this.currentPage + 1).toString(),
          pageSize: this.pageSize.toString(),
        },
      })
      .subscribe({
        next: (res) => {
          this.allFiles = res.fetchFiles;
          this.totalPages = res.totalPages;
          this.totalElements = res.totalElements;
          this.applyFilters();
          this.saveToCookies();
          setTimeout(() => this.adjustCardHeights(), 0);
        },
        error: (err) => console.error('Failed to fetch shared files', err),
      });
  }

  // Normal search (no pagination)
  searchFiles() {
    if (!this.searchQuery.trim()) {
      this.fetchSharedFiles();
      return;
    }

    this.http
      .get<SharedFile[]>(
        `http://localhost:8080/api/auth/shared-files/search?query=${this.searchQuery}`
      )
      .subscribe({
        next: (res) => {
          this.allFiles = res;
          this.applyFilters();
          this.saveToCookies();
          setTimeout(() => this.adjustCardHeights(), 0);
        },
        error: (err) => console.error('Search failed', err),
      });
  }

  setFilter(type: 'all' | 'sensitive' | 'insensitive') {
    this.filterType = type;
    this.applyFilters();
    this.saveToCookies();
  }

  private applyFilters() {
    let files = [...this.allFiles];

    if (this.filterType === 'sensitive') {
      files = files.filter((f) => f.isSensitive);
    } else if (this.filterType === 'insensitive') {
      files = files.filter((f) => !f.isSensitive);
    }

    this.filteredFiles = files;
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
  isActivePage(page: number | string): boolean {
    return typeof page === 'number' ? page - 1 === this.currentPage : false;
  }

  onPageClick(page: number | string) {
    if (typeof page === 'number') {
      this.goToPage(page - 1); // convert to 0-based
    }
  }

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
  // Load page with pagination
  loadPage() {
    this.http
      .get<PaginatedResponse<SharedFile>>('http://localhost:8080/api/auth/shared-files/by-me', {
        params: {
          pageNumber: (this.currentPage + 1).toString(),
          pageSize: this.pageSize.toString(),
        },
      })
      .subscribe((res: PaginatedResponse<SharedFile>) => {
        this.allFiles = res.fetchFiles;
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
        this.applyFilters();
        this.saveToCookies();
        setTimeout(() => this.adjustCardHeights(), 0);
      });
  }

  // Pagination Controls
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

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.searchQuery.trim() ? this.searchFilesWithPagination() : this.loadPage();
    }
  }

  // Search with Pagination
  searchFilesWithPagination() {
    if (!this.searchQuery.trim()) {
      this.currentPage = 0;
      this.loadPage();
      return;
    }

    this.http
      .get<PaginatedResponse<SharedFile>>(`http://localhost:8080/api/auth/shared-files/by-me`, {
        params: {
          keyword: this.searchQuery,
          pageNumber: (this.currentPage + 1).toString(),
          pageSize: this.pageSize.toString(),
        },
      })
      .subscribe({
        next: (res) => {
          this.allFiles = res.fetchFiles;
          this.totalPages = res.totalPages;
          this.applyFilters();
          this.saveToCookies();
        },
        error: (err) => console.error('Search failed', err),
      });
  }

  // Cookie Handling
  private saveToCookies() {
    this.cookieService.set('sharedfiles_page', this.currentPage.toString());
    this.cookieService.set('sharedfiles_filter', this.filterType);
    this.cookieService.set('sharedfiles_query', this.searchQuery);
  }

  private restoreFromCookies() {
    const page = this.cookieService.get('sharedfiles_page');
    const filter = this.cookieService.get('sharedfiles_filter');
    const query = this.cookieService.get('sharedfiles_query');

    if (page) this.currentPage = +page;
    if (filter) this.filterType = filter as any;
    if (query) this.searchQuery = query;
  }
  openInWallet(file: SharedFile) {
    this.router.navigate(['/mywallet'], {
      queryParams: { fileName: file.filename }, // Pass filename
    });
  }
}
