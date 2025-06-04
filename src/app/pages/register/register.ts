import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterPage {
  constructor(private router: Router) {}

  onSubmit() {
    // TODO: Implement registration logic
    console.log('Registration attempted');
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
