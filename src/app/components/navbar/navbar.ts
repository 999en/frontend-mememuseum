/**
 * ============================================
 * NAVIGATION BAR COMPONENT
 * ============================================
 * 
 * Main navigation component that provides:
 * - Branding and logo
 * - Search functionality with URL sync
 * - Authentication status display
 * - User authentication controls (login/logout)
 * - Meme upload modal trigger
 * 
 * The search query is synced with URL parameters to enable
 * deep linking and browser history navigation.
 */

import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { AuthService } from '../../services/auth.service';
import { AuthPromptService } from '../../services/auth-prompt.service';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialog],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavBar implements OnInit {
  // ============================================
  // Component State
  // ============================================
  
  /** Observable stream of current authenticated user */
  currentUser$!: ReturnType<AuthService['getCurrentUser']>;
  
  /** Observable stream of authentication status */
  isAuthenticated$!: ReturnType<AuthService['isAuthenticated']>;
  
  /** Currently logged in username (null if not authenticated) */
  username: string | null = null;
  
  /** Search query input field value (synced with URL params) */
  searchQuery: string = '';
  
  /** Event emitted when search is performed (legacy, kept for compatibility) */
  @Output() search = new EventEmitter<string>();
  
  /** Show confirm dialog for logout */
  showLogoutConfirm: boolean = false;

  // ============================================
  // Constructor & Initialization
  // ============================================
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private authPrompt: AuthPromptService
  ) {
    // Initialize observables
    this.currentUser$ = this.authService.getCurrentUser();
    this.isAuthenticated$ = this.authService.isAuthenticated();
    
    // Sync search field with URL query params on route changes
    // This ensures the search box reflects the current page state
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateSearchQueryFromUrl();
    });
    
    // Initialize search field with current URL params
    this.updateSearchQueryFromUrl();
  }

  ngOnInit(): void {
    // Subscribe to user changes to update username display
    this.currentUser$.subscribe(user => {
      this.username = user?.username ?? null;
    });
  }

  // ============================================
  // Navigation Methods
  // ============================================
  
  /**
   * Navigate to login page
   */
  showLogin(): void {
    this.router.navigate(['/login']);
  }

  /**
   * Navigate to registration page
   */
  showRegister(): void {
    this.router.navigate(['/register']);
  }

  /**
   * Navigate to home page and clear search
   */
  goHome(): void {
    this.searchQuery = '';
    this.router.navigate(['/']);
  }

  // ============================================
  // Search Methods
  // ============================================
  
  /**
   * Handle search form submission
   * Navigates to home page with search query as URL parameter
   * @param event - Optional form submit event
   */
  onSearch(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    
    const query = this.searchQuery.trim();
    
    if (query) {
      // Navigate with search parameter
      this.router.navigate(['/'], { queryParams: { search: query } });
    } else {
      // Clear search and show all memes
      this.router.navigate(['/']);
    }
  }

  /**
   * Update search query from current URL parameters
   * @private
   */
  private updateSearchQueryFromUrl(): void {
    const urlTree = this.router.parseUrl(this.router.url);
    this.searchQuery = urlTree.queryParams['search'] || '';
  }

  // ============================================
  // Authentication Methods
  // ============================================
  
  /**
   * Show confirmation dialog before logout
   */
  logout(): void {
    this.showLogoutConfirm = true;
  }
  
  /**
   * Confirm logout action
   */
  confirmLogout(): void {
    this.authService.logout();
    this.showLogoutConfirm = false;
  }
  
  /**
   * Cancel logout action
   */
  cancelLogout(): void {
    this.showLogoutConfirm = false;
  }

  // ============================================
  // Navigation Methods
  // ============================================
  
  /**
   * Navigate to upload page
   */
  uploadMeme(): void {
    this.router.navigate(['/upload']);
  }
}
