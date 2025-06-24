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

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  constructor(
    private memeService: MemeService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.memeService.memes$.subscribe({
      next: (memes) => {
        this.allMemes = memes;
        this.totalPages = Math.ceil(memes.length / this.pageSize);
        this.currentPage = 1;
        this.applyFiltersAndSort();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading memes:', error);
        this.error = error.message;
        this.isLoading = false;
      }
    });

    // Ascolta i cambiamenti nei parametri di ricerca
    this.route.queryParams.subscribe(params => {
      if (typeof params['search'] === 'string') {
        this.searchQuery = params['search'];
      } else {
        this.searchQuery = '';
      }
      this.currentPage = 1;
      this.applyFiltersAndSort();
    });
  }

  ngOnInit(): void {
    this.memeService.loadMemes(1);
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
    this.isRecentFirst = true;
    this.applyFiltersAndSort();
  }

  onSearch(event: Event): void {
    event.preventDefault();
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  onTagClick(tag: string) {
    this.searchQuery = tag;
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  private applyFiltersAndSort() {
    const query = this.searchQuery.trim().toLowerCase();
    let filteredMemes = this.allMemes;

    if (query) {
      filteredMemes = filteredMemes.filter(meme =>
        meme.tags.some(tag => tag.toLowerCase().includes(query))
      );
      this.currentSort = null;
    }

    if (this.currentSort === 'recent') {
      filteredMemes.sort((a, b) => {
        const comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return this.isRecentFirst ? comparison : -comparison;
      });
    } else if (this.currentSort === 'votes') {
      filteredMemes.sort((a, b) => {
        const votesA = (a.upvotes || 0) - (a.downvotes || 0);
        const votesB = (b.upvotes || 0) - (b.downvotes || 0);
        return votesB - votesA;
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
