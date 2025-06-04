import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemeCard } from '../../components/meme-card/meme-card';
import { Meme } from '../../models/meme';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MemeCard],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomePage {
  // Dati di esempio per test
  memes: Meme[] = [
    {
      _id: '1',
      title: 'Primo Meme',
      imageUrl: 'https://placekitten.com/500/500',
      uploader: { _id: '1', username: 'user1' },
      tags: ['funny', 'cats'],
      upvotes: 10,
      downvotes: 2
    }
    // Altri meme di esempio...
  ];
}
