import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MemeService } from '../../services/meme.service';
import { CommentService } from '../../services/comment.service';
import { AuthService } from '../../services/auth.service';
import { AuthPromptService } from '../../services/auth-prompt.service';
import { Meme } from '../../models/meme';
import { Comment } from '../../models/comment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-meme-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './meme-detail.html',
  styleUrl: './meme-detail.css'
})
export class MemeDetail implements OnInit {
  meme?: Meme;
  newComment: string = '';
  isLoading = true;
  error?: string;
  userVote: 'up' | 'down' | null = null;
  isOwner: boolean = false;
  isEditing = false;
  editForm = {
    title: '',
    tags: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private memeService: MemeService,
    private commentService: CommentService,
    private authService: AuthService,
    private authPrompt: AuthPromptService, // aggiunto
    private http: HttpClient
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadMeme(id);
      this.loadUserVote(id);
    }
  }

  private loadMeme(id: string) {
    this.memeService.getMemeById(id).subscribe({
      next: (meme) => {
        this.meme = meme;
        this.isLoading = false;
        this.loadComments(); // Carica i commenti insieme al meme
        this.checkOwnership();
      },
      error: (err) => {
        this.error = 'Errore nel caricamento del meme';
        this.isLoading = false;
      }
    });
  }

  private checkOwnership() {
    this.authService.getCurrentUser().subscribe(currentUser => {
      this.isOwner = !!currentUser && 
                     !!this.meme && 
                     this.meme.uploader.username === currentUser.username;
    });
  }

  private loadUserVote(memeId: string) {
    this.authService.getCurrentUser().subscribe(user => {
      if (!user) {
        this.userVote = null;
        return;
      }
      this.http.get<any[]>('/api/votes/user').subscribe({
        next: (votes) => {
          const vote = votes.find(v => {
            if (!v.meme) return false;
            if (typeof v.meme === 'string') return v.meme === memeId;
            return v.meme._id === memeId;
          });
          if (vote) {
            this.userVote = vote.value === 1 || vote.voteType === 'up' ? 'up'
              : vote.value === -1 || vote.voteType === 'down' ? 'down' : null;
          } else {
            this.userVote = null;
          }
        },
        error: () => {
          this.userVote = null;
        }
      });
    });
  }

  getCommentAuthor(comment: Comment): string {
    return comment.author?.username || 'Utente sconosciuto';
  }

  onSubmitComment() {
    if (!this.newComment.trim() || !this.meme) return;
    
    this.commentService.createComment(this.meme._id, this.newComment)
      .subscribe({
        next: (comment) => {
          // Verifica che l'autore sia presente e popolato correttamente
          if (this.meme && this.meme.comments && comment.author && comment.author.username) {
            this.meme.comments = [...this.meme.comments, comment].sort((a, b) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            this.newComment = '';
          } else {
            // Se l'autore non è popolato, ricarica i commenti
            this.loadComments();
          }
        },
        error: (error) => {
          console.error('Error posting comment:', error);
        }
      });
  }

  onClose() {
    this.router.navigate(['/']);
  }

  loadComments() {
    if (!this.meme) return;
    
    this.commentService.getComments(this.meme._id)
      .subscribe({
        next: (comments) => {
          if (this.meme) {
            // Ordina i commenti dal meno recente al più recente
            this.meme.comments = comments.sort((a, b) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          }
        },
        error: (error) => {
          console.error('Error loading comments:', error);
        }
      });
  }

  onUpvote() {
    this.authService.getCurrentUser().subscribe(user => {
      if (!user) {
        this.authPrompt?.requestLogin?.();
        return;
      }
      if (!this.meme) return;
      if (this.userVote === 'up') {
        this.http.delete(`/api/votes/${this.meme._id}`).subscribe({
          next: (result: any) => {
            this.userVote = null;
            if (this.meme) {
              this.meme.upvotes = result.upvotes;
              this.meme.downvotes = result.downvotes;
              this.loadUserVote(this.meme._id);
            }
          }
        });
      } else {
        this.http.post(`/api/votes/${this.meme._id}`, { value: 1 }).subscribe({
          next: (result: any) => {
            this.userVote = 'up';
            if (this.meme) {
              this.meme.upvotes = result.upvotes;
              this.meme.downvotes = result.downvotes;
              this.loadUserVote(this.meme._id);
            }
          }
        });
      }
    });
  }

  onDownvote() {
    this.authService.getCurrentUser().subscribe(user => {
      if (!user) {
        this.authPrompt?.requestLogin?.();
        return;
      }
      if (!this.meme) return;
      if (this.userVote === 'down') {
        this.http.delete(`/api/votes/${this.meme._id}`).subscribe({
          next: (result: any) => {
            this.userVote = null;
            if (this.meme) {
              this.meme.upvotes = result.upvotes;
              this.meme.downvotes = result.downvotes;
              this.loadUserVote(this.meme._id);
            }
          }
        });
      } else {
        this.http.post(`/api/votes/${this.meme._id}`, { value: -1 }).subscribe({
          next: (result: any) => {
            this.userVote = 'down';
            if (this.meme) {
              this.meme.upvotes = result.upvotes;
              this.meme.downvotes = result.downvotes;
              this.loadUserVote(this.meme._id);
            }
          }
        });
      }
    });
  }

  onTagClick(tag: string) {
    this.router.navigate(['/'], { queryParams: { search: tag } });
  }

  onDeleteMeme() {
    if (!this.meme || !this.isOwner) return;

    if (confirm('Sei sicuro di voler eliminare questo post? L\'azione è irreversibile.')) {
      this.memeService.deleteMeme(this.meme._id).subscribe({
        next: () => {
          // Ritorna alla home dopo l'eliminazione
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Error deleting meme:', error);
          // Gestisci l'errore (magari mostra un messaggio all'utente)
        }
      });
    }
  }

  startEdit() {
    this.isEditing = true;
    if (this.meme) {
      this.editForm.title = this.meme.title;
      this.editForm.tags = this.meme.tags.join(', ');
    }
  }

  cancelEdit() {
    this.isEditing = false;
    this.editForm = {
      title: '',
      tags: ''
    };
  }

  saveEdit() {
    if (!this.meme || !this.isOwner) return;

    const tags = this.editForm.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    this.memeService.updateMeme(this.meme._id, {
      title: this.editForm.title,
      tags: tags
    }).subscribe({
      next: () => {
        this.loadMeme(this.meme!._id); // Richiama il meme aggiornato
        this.isEditing = false;
      },
      error: (error) => {
        console.error('Error updating meme:', error);
      }
    });
  }

}
