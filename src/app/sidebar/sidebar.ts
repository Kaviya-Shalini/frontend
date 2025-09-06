import { Component, HostListener, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../services/auth.guard';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent implements OnInit {
  isClosed = false;

  @Output() sidebarToggle = new EventEmitter<boolean>();

  ngOnInit() {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isClosed = window.innerWidth <= 992;
    this.sidebarToggle.emit(this.isClosed);
  }

  toggleSidebar() {
    this.isClosed = !this.isClosed;
    this.sidebarToggle.emit(this.isClosed);
  }

  logout() {
    localStorage.clear();
    window.location.href = '/';
  }
}
