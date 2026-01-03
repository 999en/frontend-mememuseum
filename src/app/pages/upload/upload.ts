/**
 * ============================================
 * UPLOAD PAGE COMPONENT
 * ============================================
 * 
 * Dedicated page for uploading new memes with:
 * - Image file selection and preview
 * - Title and tags input
 * - Form validation
 * - Upload progress indication
 * - Responsive design for all devices
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { UploadService } from '../../services/upload.service';
import { MemeService } from '../../services/meme.service';
import { AuthService } from '../../services/auth.service';
import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialog],
  templateUrl: './upload.html',
  styleUrl: './upload.css'
})
export class UploadPage implements OnInit {
  // ============================================
  // Component State
  // ============================================
  
  /** Selected image file */
  selectedFile: File | null = null;
  
  /** Meme title */
  title: string = '';
  
  /** Comma-separated tags */
  tags: string = '';
  
  /** Upload in progress flag */
  isUploading = false;
  
  /** Error message if upload fails */
  error: string | null = null;
  
  /** Success message after upload */
  success: boolean = false;
  
  /** Image preview URL */
  imagePreview: string | null = null;
  
  /** Show confirm dialog for image removal */
  showRemoveConfirm: boolean = false;

  // ============================================
  // Constructor & Initialization
  // ============================================
  
  constructor(
    private uploadService: UploadService,
    private memeService: MemeService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is authenticated
    this.authService.isAuthenticated().subscribe(isAuth => {
      if (!isAuth) {
        // Redirect to login if not authenticated
        this.router.navigate(['/login']);
      }
    });
  }

  // ============================================
  // File Handling Methods
  // ============================================
  
  /**
   * Handle file selection from input
   * @param event - File input change event
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files?.length) {
      const file = input.files[0];
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        this.error = 'File troppo grande. Massimo 10MB.';
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        this.error = 'Formato non supportato. Usa JPG, PNG, GIF o WebP.';
        return;
      }
      
      this.selectedFile = file;
      this.error = null;
      
      // Generate preview
      this.generateImagePreview(file);
    }
  }
  
  /**
   * Generate image preview from file
   * @param file - Image file to preview
   * @private
   */
  private generateImagePreview(file: File): void {
    const reader = new FileReader();
    
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.imagePreview = e.target?.result as string;
    };
    
    reader.readAsDataURL(file);
  }
  
  /**
   * Show confirmation dialog before removing file
   */
  removeFile(): void {
    this.showRemoveConfirm = true;
  }
  
  /**
   * Confirm file removal
   */
  confirmRemoveFile(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.error = null;
    this.showRemoveConfirm = false;
  }
  
  /**
   * Cancel file removal
   */
  cancelRemoveFile(): void {
    this.showRemoveConfirm = false;
  }

  // ============================================
  // Form Submission
  // ============================================
  
  /**
   * Handle form submission and upload
   * @param event - Form submit event
   */
  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    
    // Validate required fields
    if (!this.selectedFile || !this.title.trim()) {
      this.error = 'Compila tutti i campi obbligatori';
      return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('image', this.selectedFile);
    formData.append('title', this.title.trim());
    formData.append('tags', this.tags.trim());

    this.isUploading = true;
    this.error = null;
    
    try {
      await this.uploadService.uploadMeme(formData).toPromise();
      
      // Reload memes list
      this.memeService.loadMemes(1);
      
      // Show success message
      this.success = true;
      
      // Redirect to home after 2 seconds
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 2000);
      
    } catch (err: any) {
      console.error('Upload error:', err);
      this.error = err.error?.message || 'Errore durante il caricamento del meme';
      this.isUploading = false;
    }
  }

  // ============================================
  // Navigation Methods
  // ============================================
  
  /**
   * Cancel upload and return to home
   */
  cancel(): void {
    this.router.navigate(['/']);
  }
}
