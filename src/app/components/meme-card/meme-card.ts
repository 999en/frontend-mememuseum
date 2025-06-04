import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meme } from '../../models/meme';
import { MemeService } from '../../services/meme';

@Component({
  selector: 'app-meme-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meme-card.html',
  styleUrl: './meme-card.css'
})
export class MemeCard {
  @Input() meme!: Meme;
  userVote: 'up' | 'down' | null = null;

  constructor(private memeService: MemeService) {}

  getUsername(): string {
    if (typeof this.meme.uploader === 'string') {
      return this.meme.uploader; // Return ID if string
    }
    return this.meme.uploader.username; // Return username if User object
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
}
