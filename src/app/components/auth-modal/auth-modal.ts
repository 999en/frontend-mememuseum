import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-modal.html',
  styleUrl: './auth-modal.css'
})
export class AuthModal {
  @Input() isLogin = true;
  isVisible = false;
  credentials = { username: '', password: '' };
  error: string | null = null;
  isLoading = false;

  constructor(private authService: AuthService) {}

  onSubmit(): void {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.error = null;

    console.log(`Attempting ${this.isLogin ? 'login' : 'registration'}:`, this.credentials);

    const authAction = this.isLogin ? 
      this.authService.login(this.credentials) : 
      this.authService.register(this.credentials);

    authAction.subscribe({
      next: (response) => {
        console.log('Auth successful:', response);
        this.isLoading = false;
        this.hide();
        this.resetForm();
      },
      error: (err) => {
        console.error('Auth error:', err);
        this.isLoading = false;
        this.error = err.message || 'Si è verificato un errore durante l\'autenticazione';
      }
    });
  }

  toggleMode(): void {
    this.isLogin = !this.isLogin;
    this.error = null;
    this.resetForm();
  }

  show(): void {
    this.isVisible = true;
  }

  hide(): void {
    this.isVisible = false;
    this.error = null;
    this.resetForm();
  }

  private resetForm(): void {
    this.credentials = { username: '', password: '' };
  }
}
