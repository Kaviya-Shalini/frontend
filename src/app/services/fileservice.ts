import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface FileData {
  id: number;
  filename: string;
  description: string;
  category: string;
  customCategory?: string;
  date: string;
}

interface FilesResponse {
  fetchFiles: FileData[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  lastPage: boolean;
}

@Injectable({ providedIn: 'root' })
export class FileService {
  private filesSubject = new BehaviorSubject<FileData[]>([]);
  files$ = this.filesSubject.asObservable();

  private baseUrl = 'http://localhost:8080/api/files';

  constructor(private http: HttpClient) {}

  /** ✅ Load all files and update BehaviorSubject */
  fetchAllFiles(): Observable<FilesResponse> {
    return this.http.get<FilesResponse>(`${this.baseUrl}/fetch-all`).pipe(
      tap((res) => {
        if (res.fetchFiles) {
          this.filesSubject.next(res.fetchFiles);
        }
      })
    );
  }

  /** ✅ Update after delete */
  deleteFile(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/delete/${id}`, {}).pipe(
      tap(() => {
        const updated = this.filesSubject.value.filter((f) => f.id !== id);
        this.filesSubject.next(updated);
      })
    );
  }

  /** ✅ Add new file manually after upload */
  addFile(file: FileData) {
    const updated = [...this.filesSubject.value, file];
    this.filesSubject.next(updated);
  }
}
