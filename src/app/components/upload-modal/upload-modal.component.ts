import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UploadService } from '../../services/upload.service';
import { MemeService } from '../../services/meme.service';

@Component({
  selector: 'app-upload-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upload-modal.component.html',
  styleUrls: ['./upload-modal.component.css']
})
export class UploadModalComponent implements OnInit, OnDestroy {
  @Output() close = new EventEmitter<void>();
  @Output() uploadSuccess = new EventEmitter<void>();
  
  selectedFile: File | null = null;
  title: string = '';
  tags: string = '';
  isUploading = false;
  error: string | null = null;

  constructor(
    private uploadService: UploadService,
    private memeService: MemeService
  ) {}

  ngOnInit() {
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy() {
    document.body.style.overflow = 'auto';
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  async onSubmit(event: Event) {
    event.preventDefault();
    if (!this.selectedFile || !this.title) return;

    const formData = new FormData();
    formData.append('image', this.selectedFile);
    formData.append('title', this.title);
    formData.append('tags', this.tags);

    this.isUploading = true;
    try {
      await this.uploadService.uploadMeme(formData).toPromise();
      this.memeService.loadMemes(1); // Reload memes
      this.uploadSuccess.emit();
      this.close.emit();
    } catch (err) {
      this.error = 'Errore durante il caricamento del meme';
    } finally {
      this.isUploading = false;
    }
  }
}
