import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meme } from '../../models/meme';
import { MemeService } from '../../services/meme';
import { Router } from '@angular/router';

@Component({
  selector: 'app-meme-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meme-card.html',
  styleUrl: './meme-card.css'
})
export class MemeCard {
  @Input() meme!: Meme;
  @Output() tagClick = new EventEmitter<string>();
  userVote: 'up' | 'down' | null = null;

  constructor(
    private memeService: MemeService,
    private router: Router
  ) {}

  getUsername(): string {
    if (!this.meme.uploader) {
      return this.meme.uploaderUsername || 'Utente sconosciuto';
    }
    
    if (typeof this.meme.uploader === 'string') {
      return this.meme.uploaderUsername || 'Utente sconosciuto';
    }
    
    return this.meme.uploader.username || 'Utente sconosciuto';
  }

  onUpvote() {
    if (this.userVote === 'up') {
      // Remove vote
      this.userVote = null;
      this.meme.upvotes = (this.meme.upvotes || 0) - 1;
    } else {
      // Add/Change vote
      if (this.userVote === 'down') {
        this.meme.downvotes = (this.meme.downvotes || 0) - 1;
      }
      this.userVote = 'up';
      this.meme.upvotes = (this.meme.upvotes || 0) + 1;
    }
  }

  onDownvote() {
    if (this.userVote === 'down') {
      // Remove vote
      this.userVote = null;
      this.meme.downvotes = (this.meme.downvotes || 0) - 1;
    } else {
      // Add/Change vote
      if (this.userVote === 'up') {
        this.meme.upvotes = (this.meme.upvotes || 0) - 1;
      }
      this.userVote = 'down';
      this.meme.downvotes = (this.meme.downvotes || 0) + 1;
    }
  }

  onTagClick(tag: string) {
    this.tagClick.emit(tag);
  }

  onMemeClick(event: Event) {
    // Previeni la propagazione se il click è sui bottoni di voto o sui tag
    if ((event.target as HTMLElement).closest('.voting-container, .tag')) {
      return;
    }
    this.router.navigate(['/meme', this.meme._id]);
  }
}
