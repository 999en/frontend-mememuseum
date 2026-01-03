import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthRequest, AuthResponse } from '../models/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = '/api/auth';  // Usa il path relativo, il proxy gestirà il reindirizzamento
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentUser = new BehaviorSubject<AuthResponse['user'] | null>(null);

  constructor(private http: HttpClient) {
    this.checkInitialAuth();
  }

  login(credentials: AuthRequest): Observable<AuthResponse> {
    console.log('🔐 Attempting login with username:', credentials.username);
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => {
          console.log('✅ Login response received:', response);
          console.log('🎫 Token received:', response.token ? `${response.token.substring(0, 20)}...` : 'NO TOKEN');
          this.handleAuthSuccess(response);
        }),
        catchError(error => {
          console.error('❌ Login failed:', error);
          return this.handleError(error);
        })
      );
  }

  register(credentials: AuthRequest): Observable<AuthResponse> {
    console.log('Sending registration request:', credentials);
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, credentials)
      .pipe(
        tap(response => {
          console.log('Registration successful:', response);
          this.handleAuthSuccess(response);
        }),
        catchError(this.handleError)
      );
  }

  private handleAuthSuccess(response: AuthResponse): void {
    console.log('💾 Saving auth data to localStorage');
    console.log('🎫 Token to save:', response.token ? `${response.token.substring(0, 20)}...` : 'NO TOKEN');
    console.log('👤 User to save:', response.user);
    
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    // Verifica che sia stato salvato
    const savedToken = localStorage.getItem('token');
    console.log('✅ Token saved and verified:', savedToken ? `${savedToken.substring(0, 20)}...` : 'SAVE FAILED');
    
    this.isAuthenticatedSubject.next(true);
    this.currentUser.next(response.user);
    console.log('✅ Authentication state updated');
  }

  private checkInitialAuth(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      this.isAuthenticatedSubject.next(true);
      this.currentUser.next(JSON.parse(user));
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isAuthenticatedSubject.next(false);
    this.currentUser.next(null);
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  getCurrentUser(): Observable<AuthResponse['user'] | null> {
    return this.currentUser.asObservable();
  }

  private handleError = (error: HttpErrorResponse) => {
    console.error('Auth error:', error);
    let errorMessage = 'Si è verificato un errore';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }

    return throwError(() => new Error(errorMessage));
  }
}
