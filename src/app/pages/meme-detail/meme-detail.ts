import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MemeService } from '../../services/meme.service';
import { CommentService } from '../../services/comment.service';
import { AuthService } from '../../services/auth.service';
import { AuthPromptService } from '../../services/auth-prompt.service';
import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog';
import { Meme } from '../../models/meme';
import { Comment } from '../../models/comment';

@Component({
  selector: 'app-meme-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialog],
  templateUrl: './meme-detail.html',
  styleUrl: './meme-detail.css'
})
export class MemeDetail implements OnInit {
  meme?: Meme;
  newComment: string = '';
  isLoading = true;
  error?: string;
  userVote: 'up' | 'down' | null = null;
  private currentUser: any = null;
  isEditing = false;
  editForm = {
    title: '',
    tags: ''
  };
  showDeleteConfirm = false;
  showDeleteSuccess = false;

  /**
   * Getter per verificare se l'utente corrente può modificare il meme
   * Controlla se l'utente è il proprietario del meme
   */
  get canModify(): boolean {
    if (!this.currentUser || !this.meme) return false;
    return this.meme.uploader.username === this.currentUser.username;
  }

  /**
   * Alias per retrocompatibilità
   */
  get isOwner(): boolean {
    return this.canModify;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private memeService: MemeService,
    private commentService: CommentService,
    private authService: AuthService,
    private authPrompt: AuthPromptService
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
      this.currentUser = currentUser;
      // canModify getter gestisce automaticamente il check
    });
  }

  private loadUserVote(memeId: string) {
    this.authService.getCurrentUser().subscribe(user => {
      if (!user) {
        this.userVote = null;
        return;
      }
      this.memeService.getUserVotes().subscribe({
        next: (votes) => {
          const vote = votes.find(v => {
            if (!v.meme) return false;
            if (typeof v.meme === 'string') return v.meme === memeId;
            return v.meme._id === memeId;
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
        error: (err) => {
          console.error('Error loading user votes:', err);
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
        const memeId = this.meme._id;
        this.memeService.removeVote(memeId).subscribe({
          next: () => {
            this.userVote = null;
            // Reload meme from API to get updated vote counts
            this.loadMeme(memeId);
          },
          error: (err) => console.error('Error removing vote:', err)
        });
      } else {
        const memeId = this.meme._id;
        this.memeService.voteMeme(memeId, 1).subscribe({
          next: () => {
            this.userVote = 'up';
            // Reload meme from API to get updated vote counts
            this.loadMeme(memeId);
          },
          error: (err) => console.error('Error voting:', err)
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
        const memeId = this.meme._id;
        this.memeService.removeVote(memeId).subscribe({
          next: () => {
            this.userVote = null;
            // Reload meme from API to get updated vote counts
            this.loadMeme(memeId);
          },
          error: (err) => console.error('Error removing vote:', err)
        });
      } else {
        const memeId = this.meme._id;
        this.memeService.voteMeme(memeId, -1).subscribe({
          next: () => {
            this.userVote = 'down';
            // Reload meme from API to get updated vote counts
            this.loadMeme(memeId);
          },
          error: (err) => console.error('Error voting:', err)
        });
      }
    });
  }

  onTagClick(tag: string) {
    this.router.navigate(['/'], { queryParams: { search: tag } });
  }

  /**
   * Gestisce l'eliminazione del meme con conferma
   * Mostra un dialog di conferma prima di procedere
   */
  onDeleteMeme() {
    if (!this.meme || !this.canModify) return;
    this.showDeleteConfirm = true;
  }

  /**
   * Conferma ed esegue l'eliminazione del meme
   * Naviga alla home dopo il successo
   */
  confirmDeleteMeme() {
    if (!this.meme || !this.canModify) return;
    
    this.memeService.deleteMeme(this.meme._id).subscribe({
      next: () => {
        this.showDeleteConfirm = false;
        // Mostra notifica di successo
        this.showDeleteSuccess = true;
        // Naviga alla home dopo 1 secondo
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1000);
      },
      error: (error) => {
        console.error('Error deleting meme:', error);
        this.showDeleteConfirm = false;
        // Gestisci l'errore mostrando un messaggio all'utente
        this.error = 'Errore durante l\'eliminazione del meme';
      }
    });
  }

  cancelDeleteMeme() {
    this.showDeleteConfirm = false;
  }

  /**
   * Attiva la modalità di modifica inline
   * Precompila il form con i dati correnti del meme
   */
  startEdit() {
    if (!this.canModify) return;
    
    this.isEditing = true;
    if (this.meme) {
      this.editForm.title = this.meme.title;
      this.editForm.tags = this.meme.tags.join(', ');
    }
  }

  /**
   * Annulla la modalità di modifica
   */
  cancelEdit() {
    this.isEditing = false;
    this.editForm = {
      title: '',
      tags: ''
    };
  }

  /**
   * Salva le modifiche al meme
   * Ricarica i dati aggiornati dall'API
   */
  saveEdit() {
    if (!this.meme || !this.canModify) return;

    const tags = this.editForm.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    this.memeService.updateMeme(this.meme._id, {
      title: this.editForm.title,
      tags: tags
    }).subscribe({
      next: () => {
        this.loadMeme(this.meme!._id);
        this.isEditing = false;
      },
      error: (error) => {
        console.error('Error updating meme:', error);
        this.error = 'Errore durante l\'aggiornamento del meme';
      }
    });
  }

}
