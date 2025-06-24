import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meme } from '../../models/meme';
import { MemeService } from '../../services/meme';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';

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
    private authService: AuthService,
    private http: HttpClient
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
    this.http.get<any[]>('/api/votes/user').subscribe({
      next: (votes) => {
        const vote = votes.find(v => {
          if (!v.meme) return false;
          if (typeof v.meme === 'string') return v.meme === this.meme._id;
          return v.meme._id === this.meme._id;
        });
        if (vote) {
          this.userVote = vote.value === 1 || vote.voteType === 'up' ? 'up'
            : vote.value === -1 || vote.voteType === 'down' ? 'down'
            : null;
        } else {
          this.userVote = null;
        }
      }
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
      this.http.delete(`/api/votes/${this.meme._id}`).subscribe({
        next: (result: any) => {
          this.userVote = null;
          this.meme.upvotes = result.upvotes;
          this.meme.downvotes = result.downvotes;
          this.loadUserVote();
        }
      });
    } else {
      this.http.post(`/api/votes/${this.meme._id}`, { value: 1 }).subscribe({
        next: (result: any) => {
          this.userVote = 'up';
          this.meme.upvotes = result.upvotes;
          this.meme.downvotes = result.downvotes;
          this.loadUserVote();
        }
      });
    }
  }

  onDownvote() {
    if (!this.isAuthenticated) return;
    if (this.userVote === 'down') {
      this.http.delete(`/api/votes/${this.meme._id}`).subscribe({
        next: (result: any) => {
          this.userVote = null;
          this.meme.upvotes = result.upvotes;
          this.meme.downvotes = result.downvotes;
          this.loadUserVote();
        }
      });
    } else {
      this.http.post(`/api/votes/${this.meme._id}`, { value: -1 }).subscribe({
        next: (result: any) => {
          this.userVote = 'down';
          this.meme.upvotes = result.upvotes;
          this.meme.downvotes = result.downvotes;
          this.loadUserVote();
        }
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
