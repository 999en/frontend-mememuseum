import { Component, ViewChild, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthModal } from '../auth-modal/auth-modal';
import { AuthService } from '../../services/auth.service';
import { UploadModalComponent } from '../upload-modal/upload-modal.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, AuthModal, UploadModalComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavBar implements OnInit {
  @ViewChild(AuthModal) authModal!: AuthModal;
  currentUser$!: ReturnType<AuthService['getCurrentUser']>;
  isAuthenticated$!: ReturnType<AuthService['isAuthenticated']>;
  showUploadModal = false;
  username: string | null = null;

  // Nuovo campo per ricerca
  searchQuery: string = '';

  // Evento per comunicare la ricerca al componente padre
  @Output() search = new EventEmitter<string>();

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.getCurrentUser();
    this.isAuthenticated$ = this.authService.isAuthenticated();
  }

  ngOnInit() {
    this.currentUser$.subscribe(user => {
      this.username = user?.username ?? null;
    });
  }

  showLogin() {
    this.authModal.isLogin = true;
    this.authModal.show();
  }

  showRegister() {
    this.authModal.isLogin = false;
    this.authModal.show();
  }

  logout() {
    this.authService.logout();
  }

  uploadMeme() {
    this.showUploadModal = true;
  }

  closeUploadModal() {
    this.showUploadModal = false;
  }

  // Metodo per la submit della ricerca
  onSearch(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.search.emit(this.searchQuery.trim());
  }
}
