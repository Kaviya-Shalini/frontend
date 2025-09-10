import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { SidebarComponent } from '../sidebar/sidebar';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface FetchFileResponse {
  id: number;
  filename: string;
  description: string;
  category: string;
  customCategory?: string;
  createdAt: string; // actual field from backend
}

interface FetchFilesResponse {
  fetchFiles: FetchFileResponse[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  lastPage: boolean;
}
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgChartsModule, SidebarComponent, HttpClientModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  isSidebarClosed = false;
  @ViewChild(SidebarComponent) sidebar!: SidebarComponent;

  recentUploads: { name: string; category: string; date: string }[] = [];
  categoryStats: { label: string; value: number }[] = [];

  // 🔵 User Education State
  showEducation = false;
  showEduSuggestion = false;
  openEducation() {
    this.showEducation = true;
  }
  closeEducation() {
    this.showEducation = false;
  }

  showGuide = false; // start hidden
  currentStep = 0;
  steps = [
    {
      title: '📈 Uploads Summary',
      text: 'Here you can see how many files you uploaded daily.',
    },
    {
      title: '📂 Category Distribution',
      text: 'This shows how your files are grouped into categories.',
    },
    {
      title: '📑 Recent Uploads',
      text: 'Quickly check your last uploaded files here.',
    },
    {
      title: '📊 Uploads by Category',
      text: 'Compare file counts across different categories.',
    },
    {
      title: '🔥 Most Uploaded Trend',
      text: 'See which category you uploaded the most recently.',
    },
  ];

  public lineChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: { legend: { labels: { color: '#f9fafb' } } },
    scales: { x: { ticks: { color: '#94a3b8' } }, y: { ticks: { color: '#94a3b8' } } },
  };

  public doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [{ data: [], backgroundColor: [] }],
  };
  public doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: { legend: { display: false } },
  };

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{ label: 'Files', data: [], backgroundColor: '#3b82f6' }],
  };
  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: { legend: { labels: { color: '#f9fafb' } } },
    scales: { x: { ticks: { color: '#94a3b8' } }, y: { ticks: { color: '#94a3b8' } } },
  };

  public miniLineChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  public miniLineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { x: { ticks: { color: '#94a3b8' } }, y: { ticks: { color: '#94a3b8' } } },
  };

  constructor(private http: HttpClient) {}

  // dashboard.component.ts
  ngOnInit() {
    this.checkScreenSize();
    this.fetchDashboardData();

    // ✅ Show suggestion for 6 seconds
    this.showEduSuggestion = true;
    setTimeout(() => {
      this.showEduSuggestion = false;
    }, 6000);
  }

  @HostListener('window:resize') onResize() {
    this.checkScreenSize();
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

  // ✅ Guide Controls
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
  // ✅ Fetch data from backend
  fetchDashboardData() {
    this.http
      .get<FetchFilesResponse>('http://localhost:8080/api/auth/files/fetch-all', {
        withCredentials: true,
      })
      .subscribe({
        next: (res) => {
          const files = res.fetchFiles || [];

          // 📑 Recent Uploads (latest 5)
          this.recentUploads = [...files]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5)
            .map((f) => ({
              name: f.filename,
              category: f.category === 'other' ? f.customCategory || 'Other' : f.category,
              date: new Date(f.createdAt).toLocaleDateString(),
            }));

          // 📂 Category Stats
          const categoryMap: Record<string, number> = {};
          files.forEach((f) => {
            const cat = f.category === 'other' ? f.customCategory || 'Other' : f.category;
            categoryMap[cat] = (categoryMap[cat] || 0) + 1;
          });
          this.categoryStats = Object.keys(categoryMap).map((k) => ({
            label: k,
            value: categoryMap[k],
          }));

          // 📈 Uploads Summary (last 12 days)
          const last12Days: string[] = [];
          const today = new Date();
          for (let i = 11; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            last12Days.push(d.toISOString().split('T')[0]); // yyyy-MM-dd
          }
          const uploadsByDay: number[] = last12Days.map(
            (day) => files.filter((f) => f.createdAt.split('T')[0] === day).length
          );
          this.lineChartData = {
            labels: last12Days.map((d) => d.slice(5)), // MM-dd
            datasets: [
              {
                data: uploadsByDay,
                label: 'Uploads',
                fill: true,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59,130,246,0.2)',
                tension: 0.3,
              },
            ],
          };

          // 📊 Doughnut & Bar (Category Distribution)
          const colors = [
            '#3b82f6',
            '#10b981',
            '#f59e0b',
            '#ef4444',
            '#6366f1',
            '#8b5cf6',
            '#14b8a6',
            '#e11d48',
          ];
          this.doughnutChartData = {
            labels: this.categoryStats.map((c) => c.label),
            datasets: [
              {
                data: this.categoryStats.map((c) => c.value),
                backgroundColor: colors,
              },
            ],
          };
          this.barChartData = {
            labels: this.categoryStats.map((c) => c.label),
            datasets: [
              {
                label: 'Files',
                data: this.categoryStats.map((c) => c.value),
                backgroundColor: '#3b82f6',
              },
            ],
          };

          // Most Uploaded Trend (top category uploads over days)
          const topCategory = this.categoryStats.sort((a, b) => b.value - a.value)[0]?.label;
          if (topCategory) {
            const trendData = last12Days.map(
              (day) =>
                files.filter((f) => {
                  const cat = f.category === 'other' ? f.customCategory || 'Other' : f.category;
                  return cat === topCategory && f.createdAt.split('T')[0] === day;
                }).length
            );
            this.miniLineChartData = {
              labels: last12Days.map((d) => d.slice(5)),
              datasets: [
                {
                  data: trendData,
                  label: topCategory,
                  borderColor: '#10b981',
                  fill: false,
                  tension: 0.3,
                },
              ],
            };
          }
        },
        error: (err) => console.error('Failed to fetch dashboard data', err),
      });
  }

  get chartColors(): string[] {
    return this.doughnutChartData.datasets[0].backgroundColor as string[];
  }

  // ✅ Utility to trim filename
  trimFilename(name: string, maxLength: number = 20): string {
    if (!name) return '';
    return name.length > maxLength ? name.slice(0, maxLength) + '…' : name;
  }
}
