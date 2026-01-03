import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meme } from '../../models/meme';
import { MemeService } from '../../services/meme.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-meme-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meme-card.html',
  styleUrl: './meme-card.css'
})
export class MemeCard implements OnInit, OnDestroy {
  @Input() meme!: Meme;
  @Output() tagClick = new EventEmitter<string>();
  userVote: 'up' | 'down' | null = null;
  isAuthenticated = false;
  private authSub?: Subscription;

  constructor(
    private memeService: MemeService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authSub = this.authService.isAuthenticated().subscribe(auth => {
      this.isAuthenticated = !!auth;
      if (this.isAuthenticated) {
        this.loadUserVote();
      } else {
        this.userVote = null;
      }
    });
  }

  ngOnDestroy() {
    this.authSub?.unsubscribe();
  }

  // Carica il voto dell'utente per questo meme (se autenticato)
  loadUserVote() {
    this.memeService.getUserVotes().subscribe({
      next: (votes) => {
        const vote = votes.find(v => {
          if (!v.meme) return false;
          if (typeof v.meme === 'string') return v.meme === this.meme._id;
          return v.meme._id === this.meme._id;
        });
        if (vote) {
          // Check voteType first (from API), then fall back to value
          if (vote.voteType) {
            this.userVote = vote.voteType === 'up' ? 'up' : vote.voteType === 'down' ? 'down' : null;
          } else if (vote.value !== undefined) {
            this.userVote = vote.value === 1 ? 'up' : vote.value === -1 ? 'down' : null;
          } else {
            this.userVote = null;
          }
        } else {
          this.userVote = null;
        }
      },
      error: (err) => console.error('Error loading user votes:', err)
    });
  }

  // Ricarica il meme dall'API per ottenere i conteggi aggiornati
  reloadMeme(memeId: string) {
    this.memeService.getMemeById(memeId).subscribe({
      next: (updatedMeme) => {
        this.meme.upvotes = updatedMeme.upvotes;
        this.meme.downvotes = updatedMeme.downvotes;
      },
      error: (err) => console.error('Error reloading meme:', err)
    });
  }

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
    if (!this.isAuthenticated) return;
    if (this.userVote === 'up') {
      const memeId = this.meme._id;
      this.memeService.removeVote(memeId).subscribe({
        next: () => {
          this.userVote = null;
          // Reload meme from API to get updated vote counts
          this.reloadMeme(memeId);
        },
        error: (err) => console.error('Error removing vote:', err)
      });
    } else {
      const memeId = this.meme._id;
      this.memeService.voteMeme(memeId, 1).subscribe({
        next: () => {
          this.userVote = 'up';
          // Reload meme from API to get updated vote counts
          this.reloadMeme(memeId);
        },
        error: (err) => console.error('Error voting:', err)
      });
    }
  }

  onDownvote() {
    if (!this.isAuthenticated) return;
    if (this.userVote === 'down') {
      const memeId = this.meme._id;
      this.memeService.removeVote(memeId).subscribe({
        next: () => {
          this.userVote = null;
          // Reload meme from API to get updated vote counts
          this.reloadMeme(memeId);
        },
        error: (err) => console.error('Error removing vote:', err)
      });
    } else {
      const memeId = this.meme._id;
      this.memeService.voteMeme(memeId, -1).subscribe({
        next: () => {
          this.userVote = 'down';
          // Reload meme from API to get updated vote counts
          this.reloadMeme(memeId);
        },
        error: (err) => console.error('Error voting:', err)
      });
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
