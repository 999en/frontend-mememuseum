import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Meme } from '../models/meme';

@Injectable({
  providedIn: 'root'
})
export class MemeService {
  private memes = new BehaviorSubject<Meme[]>([
    {
      _id: '1',
      title: 'First Meme',
      imageUrl: 'https://via.placeholder.com/500',
      uploader: { _id: '1', username: 'user1' },
      upvotes: 10,
      downvotes: 2,
      tags: ['funny', 'test'],
      createdAt: new Date()  // Add this line
    },
    {
      _id: '2',
      title: 'Second Meme',
      imageUrl: 'https://via.placeholder.com/500',
      uploader: { _id: '2', username: 'user2' },
      upvotes: 15,
      downvotes: 3,
      tags: ['coding', 'programming'],
      createdAt: new Date()  // Add this line
    }
  ]);

  getMemes(): Observable<Meme[]> {
    return this.memes.asObservable();
  }

  upvote(memeId: string): void {
    const updatedMemes = this.memes.value.map(meme => 
      meme._id === memeId ? { ...meme, upvotes: (meme.upvotes || 0) + 1 } : meme
    );
    this.memes.next(updatedMemes);
  }

  downvote(memeId: string): void {
    const updatedMemes = this.memes.value.map(meme => 
      meme._id === memeId ? { ...meme, downvotes: (meme.downvotes || 0) + 1 } : meme
    );
    this.memes.next(updatedMemes);
  }
}
