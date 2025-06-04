import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auth-modal.html',
  styleUrl: './auth-modal.css'
})
export class AuthModal {
  @Input() isLogin = true;
  isVisible = false;

  show() {
    this.isVisible = true;
  }

  hide() {
    this.isVisible = false;
  }

  toggleMode() {
    this.isLogin = !this.isLogin;
  }

  onSubmit() {
    // TODO: Implement auth logic
    console.log('Auth attempted');
    this.hide();
  }
}
