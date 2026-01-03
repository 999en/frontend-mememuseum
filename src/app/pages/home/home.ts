import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MemeCard } from '../../components/meme-card/meme-card';
import { MemeService } from '../../services/meme.service';
import { Meme } from '../../models/meme';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MemeCard, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomePage implements OnInit {
  memes: Meme[] = [];
  allMemes: Meme[] = [];
  memeOfTheDay: Meme | null = null;
  isLoading = true;
  error: string | null = null;
  searchQuery: string = '';
  currentSort: 'recent' | 'votes' | null = null;
  isRecentFirst = true;
  isMostVotedFirst = true;

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  constructor(
    private memeService: MemeService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Ascolta i cambiamenti nei parametri di ricerca
    this.route.queryParams.subscribe(params => {
      const searchParam = params['search'];
      
      if (typeof searchParam === 'string' && searchParam.trim() !== '') {
        this.searchQuery = searchParam.trim();
        this.currentPage = 1;
        // Esegui la ricerca per tag
        this.performSearch(this.searchQuery);
      } else {
        // Campo vuoto o assente: carica tutti i meme
        this.searchQuery = '';
        this.currentPage = 1;
        this.loadAllMemes();
      }
    });
  }

  ngOnInit(): void {
    // Non caricare qui, viene gestito nel constructor tramite queryParams
  }

  private loadAllMemes(): void {
    this.isLoading = true;
    this.error = null;
    
    this.memeService.memes$.subscribe({
      next: (memes) => {
        this.allMemes = memes;
        this.totalPages = Math.ceil(memes.length / this.pageSize);
        this.applyFiltersAndSort();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading memes:', error);
        this.isLoading = false;
      }
    });
    
    // Trigger il caricamento se non ci sono meme
    if (this.allMemes.length === 0) {
      this.memeService.loadMemes(1);
    }
  }

  private performSearch(query: string): void {
    this.isLoading = true;
    this.error = null;
    
    const sortBy = this.currentSort === 'votes' ? 'votes' : 'createdAt';
    const order = this.currentSort === 'votes' 
      ? (this.isMostVotedFirst ? 'desc' : 'asc')
      : (this.isRecentFirst ? 'desc' : 'asc');
    
    this.memeService.searchMemesByTag(query, sortBy, order).subscribe({
      next: (memes) => {
        if (memes.length === 0) {
          // API non ha trovato risultati o è fallita, usa filtro locale
          this.useLocalSearch(query);
        } else {
          // API ha trovato risultati
          this.allMemes = memes;
          this.totalPages = Math.ceil(memes.length / this.pageSize);
          this.applyFiltersAndSort();
          this.isLoading = false;
        }
      },
      error: () => {
        // In caso di errore, usa filtro locale come fallback
        console.warn('Search API failed, using local filtering');
        this.useLocalSearch(query);
      }
    });
  }

  private useLocalSearch(query: string): void {
    // Fallback: filtra localmente dai meme già caricati
    this.memeService.memes$.subscribe({
      next: (allMemes) => {
        if (allMemes.length === 0) {
          // Se non ci sono meme caricati, caricali
          this.memeService.loadMemes(1);
          return;
        }
        
        const filtered = allMemes.filter(meme =>
          meme.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );
        
        this.allMemes = filtered;
        this.totalPages = Math.ceil(filtered.length / this.pageSize);
        this.applyFiltersAndSort();
        this.isLoading = false;
      }
    });
  }

  // ✅ Mostra un meme casuale in base al giorno
  showMemeOfTheDay(): void {
    if (!this.allMemes || this.allMemes.length === 0) return;

    const seed = this.generateDailySeed();
    const index = seed % this.allMemes.length;
    const selected = this.allMemes[index];

    // Naviga direttamente al dettaglio del meme
    this.router.navigate(['/meme', selected._id]);
  }

  private generateDailySeed(): number {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    return seed;
  }

  sortByRecent() {
    this.currentSort = 'recent';
    this.isRecentFirst = !this.isRecentFirst;
    this.applyFiltersAndSort();
  }

  sortByVotes() {
    this.currentSort = 'votes';
    this.isMostVotedFirst = !this.isMostVotedFirst;
    this.applyFiltersAndSort();
  }

  onSearch(event: Event): void {
    event.preventDefault();
    // Non fare nulla qui, lascia che il cambio di route gestisca tutto
    // Questo metodo potrebbe anche essere rimosso se la navbar gestisce già la navigazione
  }

  onTagClick(tag: string) {
    // Naviga con il parametro search, il constructor gestirà il resto
    this.router.navigate(['/'], { queryParams: { search: tag } });
  }

  private applyFiltersAndSort() {
    let filteredMemes = [...this.allMemes];

    // Apply sorting
    if (this.currentSort === 'recent') {
      filteredMemes.sort((a, b) => {
        const comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return this.isRecentFirst ? comparison : -comparison;
      });
    } else if (this.currentSort === 'votes') {
      filteredMemes.sort((a, b) => {
        const votesA = (a.upvotes || 0) - (a.downvotes || 0);
        const votesB = (b.upvotes || 0) - (b.downvotes || 0);
        return this.isMostVotedFirst ? votesB - votesA : votesA - votesB;
      });
    }

    this.totalPages = Math.max(1, Math.ceil(filteredMemes.length / this.pageSize));
    this.memes = this.paginateMemes(filteredMemes);
  }

  private paginateMemes(memes: Meme[]): Meme[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return memes.slice(startIndex, startIndex + this.pageSize);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFiltersAndSort();
      window.scrollTo(0, 0); // Scroll istantaneo in alto
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFiltersAndSort();
      window.scrollTo(0, 0); // Scroll istantaneo in alto
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFiltersAndSort();
      window.scrollTo(0, 0); // Scroll istantaneo in alto
    }
  }
}
