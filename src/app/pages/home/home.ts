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
  }

  onTagClick(tag: string) {
    this.searchQuery = tag;
    this.onSearch(new Event('tagclick'));
  }
}
