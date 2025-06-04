import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home';

export const routes: Routes = [
  { path: '', component: HomePage },
  { 
    path: 'login', 
    loadComponent: () => import('./pages/login/login').then(m => m.LoginPage)
  },
  { 
    path: 'register', 
    loadComponent: () => import('./pages/register/register').then(m => m.RegisterPage)
  }
];
