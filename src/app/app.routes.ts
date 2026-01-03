import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home';
import { MemeDetail } from './pages/meme-detail/meme-detail';

export const routes: Routes = [
  { path: '', component: HomePage },
  { 
    path: 'login', 
    loadComponent: () => import('./pages/login/login').then(m => m.LoginPage)
  },
  { 
    path: 'register', 
    loadComponent: () => import('./pages/register/register').then(m => m.RegisterPage)
  },
  { 
    path: 'upload', 
    loadComponent: () => import('./pages/upload/upload').then(m => m.UploadPage)
  },
  {
    path: 'meme/:id',
    component: MemeDetail
  }
];
