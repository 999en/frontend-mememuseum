import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, tap, throwError, of } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { Meme } from '../models/meme';
import { Vote } from '../models/vote';
import { PaginatedResponse } from '../models/pagination';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MemeService {
  private memesSubject = new BehaviorSubject<Meme[]>([]);
  public memes$ = this.memesSubject.asObservable();
  private currentPage = 1;
  private readonly LIMIT = 10;
  private loading = false;
  private hasMore = true;

  constructor(private http: HttpClient) {
    this.loadMemes();
  }

  loadMemes(page: number = 1): void {
    if (this.loading || (!this.hasMore && page > 1)) return;
    
    this.loading = true;
    console.log('Loading memes, page:', page);
    
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', this.LIMIT.toString());

    this.http.get<Meme[]>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MEMES}`,
      { 
        params
      }
    ).pipe(
      tap(response => console.log('Raw API response:', response)),
      map(memes => memes.map(meme => ({
        ...meme,
        createdAt: new Date(meme.createdAt),
        firstCommentTimestamp: meme.firstCommentTimestamp ? new Date(meme.firstCommentTimestamp) : undefined,
        comments: meme.comments?.map(comment => ({
          ...comment,
          createdAt: new Date(comment.createdAt)
        }))
      }))),
      map(memes => this.processImageUrls(memes)),
      tap(memes => {
        this.hasMore = memes.length === this.LIMIT;
        console.log('Processed memes:', memes);
      }),
      catchError(this.handleImageError)
    ).subscribe({
      next: (memes) => {
        const currentMemes = page === 1 ? [] : this.memesSubject.value;
        const updatedMemes = [...currentMemes, ...memes];
        this.memesSubject.next(updatedMemes);
        this.currentPage = page;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading memes:', error);
        this.loading = false;
      }
    });
  }

  getAllMemes(): Observable<Meme[]> {
    return this.memes$;
  }

  getMemeById(id: string): Observable<Meme> {
    return this.http.get<Meme>(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MEMES}/${id}?populate=uploader`)
      .pipe(
        map(meme => this.processImageUrl(meme)),
        catchError(this.handleError)
      );
  }

  uploadMeme(formData: FormData): Observable<Meme> {
    return this.http.post<Meme>(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MEMES}`, formData)
      .pipe(
        tap(newMeme => {
          const currentMemes = this.memesSubject.value;
          this.memesSubject.next([newMeme, ...currentMemes]);
        }),
        catchError(this.handleError)
      );
  }

  updateMeme(memeId: string, data: { title?: string; tags?: string[] }): Observable<Meme> {
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);

    if (data.tags) {
      const tagsString = data.tags.join(', ');
      formData.append('tags', tagsString);
    }

    return this.http.patch<Meme>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MEMES}/${memeId}`,
      formData
    ).pipe(catchError(this.handleError));
  }


  deleteMeme(memeId: string): Observable<any> {
    return this.http.delete(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MEMES}/${memeId}`
    ).pipe(catchError(this.handleError));
  }

  searchMemes(query: { [key: string]: string }): Observable<Meme[]> {
    const params = new HttpParams({ fromObject: query });
    return this.http.get<Meme[]>(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MEMES}/search`, { params })
      .pipe(
        map(memes => this.processImageUrls(memes)),
        catchError(this.handleError)
      );
  }

  searchMemesByTag(tag: string, sortBy: 'createdAt' | 'votes' = 'createdAt', order: 'asc' | 'desc' = 'desc'): Observable<Meme[]> {
    // Se il tag è vuoto, ritorna un observable vuoto
    if (!tag || tag.trim() === '') {
      return of([]);
    }

    const params = new HttpParams()
      .set('tag', tag.trim())
      .set('sortBy', sortBy)
      .set('order', order);
    
    return this.http.get<Meme[]>(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MEMES}/search`, { params })
      .pipe(
        map(memes => memes.map(meme => ({
          ...meme,
          createdAt: new Date(meme.createdAt),
          firstCommentTimestamp: meme.firstCommentTimestamp ? new Date(meme.firstCommentTimestamp) : undefined,
          comments: meme.comments?.map(comment => ({
            ...comment,
            createdAt: new Date(comment.createdAt)
          }))
        }))),
        map(memes => this.processImageUrls(memes)),
        catchError((error) => {
          // Log dell'errore per debug ma non propagarlo
          console.warn('API search failed, will use local filtering:', error);
          // Ritorna array vuoto invece di propagare l'errore
          return of([]);
        })
      );
  }

  private processImageUrls(memes: Meme[]): Meme[] {
    return memes.map(meme => this.processImageUrl(meme));
  }

  private processImageUrl(meme: Meme): Meme {
    if (!meme.imageUrl) {
      console.warn('Meme without imageUrl:', meme);
      return meme;
    }
    
    const cleanImageUrl = meme.imageUrl.replace('/uploads//uploads/', '/uploads/');
    
    return {
      ...meme,
      imageUrl: cleanImageUrl.startsWith('http') 
        ? cleanImageUrl 
        : `${environment.backendUrl}${cleanImageUrl}`,
      uploader: meme.uploader || { _id: 'unknown', username: 'Utente sconosciuto' },
      comments: meme.comments || [],
      createdAt: new Date(meme.createdAt),
      firstCommentTimestamp: meme.firstCommentTimestamp ? new Date(meme.firstCommentTimestamp) : undefined
    };
  }

  validateFile(file: File): boolean {
    return (
      API_CONFIG.SUPPORTED_FORMATS.includes(file.type) &&
      file.size <= API_CONFIG.MAX_FILE_SIZE
    );
  }

  private getEtagHeader(): HttpHeaders | undefined {
    const etag = localStorage.getItem('memes-etag');
    if (etag) {
      return new HttpHeaders().set('If-None-Match', etag);
    }
    return undefined;
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Si è verificato un errore';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else if (error.status) {
      errorMessage = `Errore: ${error.status}. ${error.error?.message || ''}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }

  private handleImageError(error: HttpErrorResponse) {
    if (error.status === 413) {
      return throwError(() => new Error('Immagine troppo grande. Massimo 10MB.'));
    }
    if (error.status === 415) {
      return throwError(() => new Error('Formato immagine non supportato. Usa JPG, PNG o GIF.'));
    }
    if (error.status === 422) {
      return throwError(() => new Error('Errore nel processamento dell\'immagine.'));
    }
    return this.handleError(error);
  }

  public hasMoreMemes(): boolean {
    return this.hasMore;
  }

  public isLoading(): boolean {
    return this.loading;
  }

  public loadMore(): void {
    if (!this.loading && this.hasMore) {
      this.loadMemes(this.currentPage + 1);
    }
  }

  voteMeme(memeId: string, value: 1 | -1): Observable<{ upvotes: number; downvotes: number }> {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VOTES}/${memeId}`;
    console.log('🗳️ Voting on meme:', memeId, 'value:', value);
    console.log('🔗 Vote URL:', url);
    const token = localStorage.getItem('token');
    console.log('🎫 Token available:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
    
    return this.http.post<{ upvotes: number; downvotes: number }>(
      url,
      { value }
    ).pipe(
      tap(response => console.log('✅ Vote successful:', response)),
      catchError(error => {
        console.error('❌ Vote failed:', error);
        return this.handleError(error);
      })
    );
  }

  removeVote(memeId: string): Observable<{ upvotes: number; downvotes: number }> {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VOTES}/${memeId}`;
    console.log('🗑️ Removing vote from meme:', memeId);
    console.log('🔗 Remove vote URL:', url);
    
    return this.http.delete<any>(url).pipe(
      tap(response => console.log('✅ Vote removed:', response)),
      // After removing vote, fetch the meme to get updated counts
      map(response => {
        // If the response already includes upvotes/downvotes, return it
        if (response.upvotes !== undefined && response.downvotes !== undefined) {
          return { upvotes: response.upvotes, downvotes: response.downvotes };
        }
        // Otherwise return zeros as fallback (will be updated by reloading the meme)
        return { upvotes: 0, downvotes: 0 };
      }),
      catchError(error => {
        console.error('❌ Remove vote failed:', error);
        return this.handleError(error);
      })
    );
  }

  getUserVotes(): Observable<Vote[]> {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VOTES}/user`;
    console.log('👤 Fetching user votes');
    console.log('🔗 User votes URL:', url);
    
    return this.http.get<Vote[]>(url).pipe(
      tap(response => console.log('✅ User votes fetched:', response)),
      catchError(error => {
        console.error('❌ Fetch user votes failed:', error);
        return this.handleError(error);
      })
    );
  }
}
