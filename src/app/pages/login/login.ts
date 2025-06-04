import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginPage {
  constructor(private router: Router) {}

  onSubmit() {
    // TODO: Implement login logic
    console.log('Login attempted');
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
