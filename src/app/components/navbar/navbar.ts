import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthModal } from '../auth-modal/auth-modal';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, AuthModal],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavBar {
  @ViewChild(AuthModal) authModal!: AuthModal;

  showLogin() {
    this.authModal.isLogin = true;
    this.authModal.show();
  }

  showRegister() {
    this.authModal.isLogin = false;
    this.authModal.show();
  }
}
