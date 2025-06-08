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
  allMemes: Meme[] = []; // Store all memes for filtering
  isLoading = true;
  error: string | null = null;
  searchQuery: string = '';
  currentSort: 'recent' | 'votes' | null = null;
  isRecentFirst = true;

  constructor(private memeService: MemeService) {
    this.memeService.memes$.subscribe({
      next: (memes) => {
        this.allMemes = memes; // Store all memes
        this.memes = memes; // Initially show all memes
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

  sortByRecent() {
    this.currentSort = 'recent';
    this.isRecentFirst = !this.isRecentFirst;
    this.applyCurrentSort();
  }

  sortByVotes() {
    this.currentSort = 'votes';
    // Reset del flag isRecentFirst quando passiamo ai voti
    this.isRecentFirst = true;
    this.applyCurrentSort();
  }

  private applyCurrentSort() {
    if (this.currentSort === 'recent') {
      this.memes.sort((a, b) => {
        const comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return this.isRecentFirst ? comparison : -comparison;
      });
    } else if (this.currentSort === 'votes') {
      // Ordina per numero netto di voti (upvotes - downvotes) in ordine decrescente
      this.memes.sort((a, b) => {
        const votesA = (a.upvotes || 0) - (a.downvotes || 0);
        const votesB = (b.upvotes || 0) - (b.downvotes || 0);
        return votesB - votesA;
      });
    }
  }

  onSearch(event: Event): void {
    event.preventDefault();
    const query = this.searchQuery.trim().toLowerCase();
    
    if (!query) {
      this.memes = this.allMemes; // Reset to all memes if search is empty
      return;
    }

    // Filter memes locally based on tags
    this.memes = this.allMemes.filter(meme => 
      meme.tags.some(tag => tag.toLowerCase().includes(query))
    );

    this.currentSort = null;
  }

  onTagClick(tag: string) {
    this.searchQuery = tag;
    this.onSearch(new Event('tagclick'));
  }
}
