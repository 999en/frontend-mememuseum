import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router'; // aggiungi import

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

  constructor(private authService: AuthService, private router: Router) {} // aggiungi router

  onSubmit(): void {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.error = null;

    const authAction = this.isLogin ? 
      this.authService.login(this.credentials) : 
      this.authService.register(this.credentials);

    authAction.subscribe({
      next: (response) => {
        console.log('Auth successful:', response);
        this.isLoading = false;
        this.hide();
        this.resetForm();
        // Naviga in base al tipo di azione
        if (this.isLogin) {
          this.router.navigate(['/']);
        } else {
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        console.error('Auth error:', err);
        this.isLoading = false;
        if (err && err.message) {
          const msg = err.message.toLowerCase();
          if (this.isLogin) {
            if (msg.includes('utente non trovato')) {
              this.error = 'Utente inesistente';
            } else if (msg.includes('password non valida')) {
              this.error = 'Password non valida, riprova';
            } else if (msg.includes('username e password sono richiesti')) {
              this.error = 'Username e password sono richiesti';
            } else {
              this.error = 'Password non valida o utente inesistente';
            }
          } else {
            if (msg.includes('username già in uso')) {
              this.error = 'Username già in uso';
            } else if (msg.includes('username e password sono richiesti')) {
              this.error = 'Username e password sono richiesti';
            } else {
              this.error = 'Errore durante la registrazione';
            }
          }
        } else {
          this.error = 'Si è verificato un errore durante l\'autenticazione';
        }
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
