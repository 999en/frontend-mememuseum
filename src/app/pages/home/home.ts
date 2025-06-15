import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MemeCard } from '../../components/meme-card/meme-card';
import { MemeService } from '../../services/meme.service';
import { Meme } from '../../models/meme';

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
  isLoading = true;
  error: string | null = null;
  searchQuery: string = '';
  currentSort: 'recent' | 'votes' | null = null;
  isRecentFirst = true;

  // ✅ Paginazione
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  constructor(private memeService: MemeService) {
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
  }

  ngOnInit(): void {
    this.memeService.loadMemes(1);
  }

  // ✅ Ordinamento
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

  // ✅ Ricerca
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

  // ✅ Applica ricerca + ordinamento + paginazione
  private applyFiltersAndSort() {
    const query = this.searchQuery.trim().toLowerCase();
    let filteredMemes = this.allMemes;

    if (query) {
      filteredMemes = filteredMemes.filter(meme =>
        meme.tags.some(tag => tag.toLowerCase().includes(query))
      );
      this.currentSort = null; // Reset sorting if searching
    }

    // Ordina
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

  // ✅ Navigazione pagine
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFiltersAndSort();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFiltersAndSort();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFiltersAndSort();
    }
  }
}
