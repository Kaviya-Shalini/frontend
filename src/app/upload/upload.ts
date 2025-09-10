import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SidebarComponent } from '../sidebar/sidebar';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, SidebarComponent],
  templateUrl: './upload.html',
  styleUrl: './upload.css',
})
export class UploadComponent implements OnInit {
  categories = [
    'aadhaar',
    'pan',
    'id proof',
    'insurance docs',
    'school marksheets',
    'college marksheets',
    'asset docs',
    'other',
  ];

  selectedFiles: File[] = [];
  manualFileNames: string[] = [];
  description = '';
  selectedCategory = '';
  customCategory = '';

  uploadMessage = '';
  uploadSuccess = false;
  errorMessage = '';
  submitted = false;

  isSidebarClosed = false;

  @ViewChild(SidebarComponent) sidebar!: SidebarComponent;
  @ViewChild('fileInputRef') fileInputRef!: ElementRef<HTMLInputElement>;

  constructor(private http: HttpClient) {}
  // Guide State & Controls for Upload Page
  showGuide = false; // guide starts hidden
  currentStep = 0;

  steps = [
    {
      title: '🔐 Why SecureVault?',
      text: 'Before using Upload, understand the purpose: all your uploaded files are encrypted and safely stored. Only you can download and view them. When you share, the encrypted file is sent securely and can only be unlocked by the recipient with their key.',
    },
    {
      title: '📂 Select Files',
      text: 'Click the "Browse" button to select one or multiple files you want to upload.',
    },
    {
      title: '📝 Add Description',
      text: 'Provide a short description for each file so you can remember its purpose later.',
    },
    {
      title: '📑 Choose Category',
      text: 'Select a category from the dropdown menu to organize your file. Example: Insurance, Certificates, or Bills.',
    },
    {
      title: '✏️ Custom Category',
      text: 'If you choose "Other" in the dropdown, you can type your own custom category name.',
    },
    {
      title: '⬆ Upload File',
      text: 'Finally, click the "Upload File" button. A message will confirm: "File uploaded successfully! To view uploaded files, go to your MyWallet page."',
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

  trackByIndex = (_: number, __: any) => _;

  private addFiles(files: FileList | File[]) {
    const incoming = Array.from(files);
    const existingKeys = new Set(
      this.selectedFiles.map((f) => `${f.name}|${f.size}|${f.lastModified}`)
    );

    incoming.forEach((f) => {
      const key = `${f.name}|${f.size}|${f.lastModified}`;
      if (!existingKeys.has(key)) {
        this.selectedFiles.push(f);
        this.manualFileNames.push(f.name);
        existingKeys.add(key);
      }
    });
  }

  clearAll() {
    this.selectedFiles = [];
    this.manualFileNames = [];
    this.description = '';
    this.selectedCategory = '';
    this.customCategory = '';
    this.errorMessage = '';
    this.submitted = false;
    if (this.fileInputRef) this.fileInputRef.nativeElement.value = '';
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
    this.manualFileNames.splice(index, 1);
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.addFiles(input.files);
      input.value = '';
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    (event.currentTarget as HTMLElement).classList.add('dragover');
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    (event.currentTarget as HTMLElement).classList.remove('dragover');
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    (event.currentTarget as HTMLElement).classList.remove('dragover');
    if (event.dataTransfer?.files?.length) {
      this.addFiles(event.dataTransfer.files);
    }
  }

  onUpload() {
    this.submitted = true;
    this.errorMessage = '';
    this.uploadMessage = '';
    this.uploadSuccess = false;

    if (this.selectedCategory === 'other' && !this.customCategory.trim()) {
      this.errorMessage = 'Enter your custom category to upload';
      return;
    }

    this.uploadFiles();
  }

  private uploadFiles() {
    if (!this.selectedFiles.length) return;

    const categoryToSend =
      this.selectedCategory === 'other' ? this.customCategory.trim() : this.selectedCategory;

    const fd = new FormData();
    this.selectedFiles.forEach((file) => {
      fd.append('files', file);
    });

    const params = new URLSearchParams({
      files: this.selectedFiles.map((f, i) => this.manualFileNames[i] || f.name).join(','),
      description: this.description || '',
      category: categoryToSend,
    }).toString();

    this.http.post(`http://localhost:8080/api/auth/files/upload?${params}`, fd).subscribe({
      next: () => {
        this.uploadSuccess = true;
        this.uploadMessage = '✅ File(s) uploaded successfully!';
        this.submitted = false; //  stop spinner
      },
      error: () => {
        this.uploadSuccess = false;
        this.uploadMessage = '❌ Failed to upload file(s). Please try again.';
        this.submitted = false; //  stop spinner
      },
    });
  }
}
