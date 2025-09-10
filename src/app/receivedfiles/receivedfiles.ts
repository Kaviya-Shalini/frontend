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

interface ReceivedFile {
  senderName: string;
  recipientName: string;
  filename: string;
  category: string;
  isSensitive: boolean;
}

@Component({
  selector: 'app-receivedfiles',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, SidebarComponent],
  templateUrl: './receivedfiles.html',
  styleUrl: './receivedfiles.css',
})
export class ReceivedFilesComponent implements OnInit, AfterViewInit {
  allFiles: ReceivedFile[] = [];
  filteredFiles: ReceivedFile[] = [];
  searchQuery: string = '';
  filterType: 'all' | 'sensitive' | 'insensitive' = 'all';
  isSidebarClosed = false;

  @ViewChildren('cardEl') cardElements!: QueryList<ElementRef>;
  @ViewChild(SidebarComponent) sidebar!: SidebarComponent;

  constructor(
    private http: HttpClient,
    private router: Router,
    private paginationService: PaginationService
  ) {}
  // Guide State for Received Files Page
  showGuide = false;
  currentStep = 0;

  steps = [
    {
      title: '📥 Received Files',
      text: 'This page shows all the files you have received from other users. Each file is displayed as a card.',
    },
    {
      title: '📄 File Card Details',
      text: 'Each card contains the file name, sender name, your receiver name, and the category of the file.',
    },
    {
      title: '🔍 Search & Filter',
      text: 'Use the search bar to find files by filename, sender name, or category. You can also filter files using List1 or List2.',
    },
    {
      title: '⬇ Download Files',
      text: 'You cannot directly open a file here. To access a received file, go to your MyWallet page where you can securely download it.',
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
    this.fetchReceivedFiles();
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

  fetchReceivedFiles() {
    this.http
      .get<PaginatedResponse<ReceivedFile>>('http://localhost:8080/api/auth/shared-files/to-me', {
        params: {
          pageNumber: this.currentPage.toString(),
          pageSize: this.pageSize.toString(),
        },
      })
      .subscribe({
        next: (res) => {
          this.allFiles = res.fetchFiles;
          this.totalPages = res.totalPages;
          this.totalElements = res.totalElements;
          this.applyFilters();
          setTimeout(() => this.adjustCardHeights(), 0);
        },
        error: (err) => console.error('Failed to fetch received files', err),
      });
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

  isActivePage(page: number | string): boolean {
    return typeof page === 'number' ? page - 1 === this.currentPage : false;
  }

  onPageClick(page: number | string) {
    if (typeof page === 'number') {
      this.goToPage(page - 1); // convert to 0-based
    }
  }
  searchFilesWithPagination() {
    if (!this.searchQuery.trim()) {
      this.currentPage = 0;
      this.loadPage();
      return;
    }

    this.http
      .get<PaginatedResponse<ReceivedFile>>('http://localhost:8080/api/auth/shared-files/to-me', {
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
        },
        error: (err) => console.error('Search failed', err),
      });
  }

  setFilter(type: 'all' | 'sensitive' | 'insensitive') {
    this.filterType = type;
    this.applyFilters();
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
    this.cardElements.forEach((card) => {
      card.nativeElement.style.height = maxHeight + 'px';
    });
  }

  currentPage = 0;
  totalPages = 0;
  pageSize = 6;
  totalElements = 0;

  loadPage() {
    this.http
      .get<PaginatedResponse<ReceivedFile>>('http://localhost:8080/api/auth/shared-files/to-me', {
        params: {
          pageNumber: (this.currentPage + 1).toString(),
          pageSize: this.pageSize.toString(),
        },
      })
      .subscribe((res: PaginatedResponse<ReceivedFile>) => {
        this.allFiles = res.fetchFiles;
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
        this.applyFilters();
        setTimeout(() => this.adjustCardHeights(), 0);
      });
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

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.searchQuery.trim() ? this.searchFilesWithPagination() : this.loadPage();
    }
  }
  openInWallet(file: ReceivedFile) {
    this.router.navigate(['/mywallet'], {
      queryParams: { fileName: file.filename }, // Pass filename
    });
  }
}
