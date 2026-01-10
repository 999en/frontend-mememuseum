import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginPage {
  username: string = '';
  password: string = '';
  error: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onSubmit() {
    this.error = '';
    
    // Validazione base
    if (!this.username.trim() || !this.password.trim()) {
      this.error = 'Username e password sono obbligatori';
      return;
    }

    this.isLoading = true;

    this.authService.login({
      username: this.username.trim(),
      password: this.password
    }).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.isLoading = false;
        // Naviga alla home dopo il login
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Login error:', error);
        this.isLoading = false;
        this.error = error.message || 'Errore durante il login. Verifica le credenziali.';
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
