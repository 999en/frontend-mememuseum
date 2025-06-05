import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, tap, throwError } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { Meme } from '../models/meme';
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
        params,
        headers: this.getHeaders()
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

  updateMeme(id: string, formData: FormData): Observable<Meme> {
    return this.http.patch<Meme>(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MEMES}/${id}`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteMeme(id: string): Observable<void> {
    return this.http.delete<void>(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MEMES}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  searchMemes(query: { [key: string]: string }): Observable<Meme[]> {
    const params = new HttpParams({ fromObject: query });
    return this.http.get<Meme[]>(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MEMES}/search`, { params })
      .pipe(
        map(memes => this.processImageUrls(memes)),
        catchError(this.handleError)
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
    
    // Remove duplicate /uploads from path if present
    const cleanImageUrl = meme.imageUrl.replace('/uploads//uploads/', '/uploads/');
    
    // Process uploader information
    const uploaderInfo = meme.uploader && typeof meme.uploader === 'object' 
      ? meme.uploader 
      : { _id: 'unknown', username: meme.uploaderUsername || 'Utente sconosciuto' };

    // Return processed meme with both image and uploader info
    return {
      ...meme,
      imageUrl: cleanImageUrl.startsWith('http') 
        ? cleanImageUrl 
        : `${environment.backendUrl}${cleanImageUrl}`,
      uploader: uploaderInfo,
      uploaderUsername: uploaderInfo.username
    };
  }

  validateFile(file: File): boolean {
    return (
      API_CONFIG.SUPPORTED_FORMATS.includes(file.type) &&
      file.size <= API_CONFIG.MAX_FILE_SIZE
    );
  }

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    
    const token = localStorage.getItem('token');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const etag = localStorage.getItem('memes-etag');
    if (etag) {
      headers = headers.set('If-None-Match', etag);
    }

    return headers;
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
}
