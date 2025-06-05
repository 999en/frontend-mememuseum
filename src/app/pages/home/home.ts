import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemeCard } from '../../components/meme-card/meme-card';
import { MemeService } from '../../services/meme.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { Meme } from '../../models/meme';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MemeCard],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomePage implements OnInit {
  memes: Meme[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(private memeService: MemeService) {
    this.memeService.memes$.subscribe({
      next: (memes) => {
        console.log('Received memes:', memes);
        this.memes = memes;
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
    console.log('HomePage initialized, loading memes...');
    this.memeService.loadMemes(1);
  }
}
