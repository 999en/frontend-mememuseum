import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterPage {
  username: string = '';
  password: string = '';
  error: string = '';
  isLoading: boolean = false;

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

    if (this.username.trim().length < 3) {
      this.error = 'Username deve contenere almeno 3 caratteri';
      return;
    }

    if (this.password.length < 6) {
      this.error = 'Password deve contenere almeno 6 caratteri';
      return;
    }

    this.isLoading = true;

    this.authService.register({
      username: this.username.trim(),
      password: this.password
    }).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.isLoading = false;
        // Naviga alla home dopo la registrazione
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.isLoading = false;
        this.error = error.message || 'Errore durante la registrazione. Username potrebbe essere già in uso.';
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
