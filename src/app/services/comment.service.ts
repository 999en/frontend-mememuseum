import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError, map } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { Comment } from '../models/comment';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  constructor(private http: HttpClient) {}

  createComment(memeId: string, text: string): Observable<Comment> {
    return this.http.post<Comment>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMMENTS}/${memeId}?populate=author`,
      { text }
    ).pipe(
      map(response => ({
        ...response,
        createdAt: new Date(response.createdAt),
        author: response.author // Assicurarsi che l'autore sia incluso nella risposta
      })),
      catchError(this.handleError)
    );
  }

  getComments(memeId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMMENTS}/${memeId}?populate=author`
    ).pipe(
      map(comments => comments.map(comment => ({
        ...comment,
        createdAt: new Date(comment.createdAt),
        author: comment.author
      }))),
      catchError(this.handleError)
    );
  }

  updateComment(commentId: string, text: string): Observable<Comment> {
    return this.http.patch<Comment>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMMENTS}/${commentId}`,
      { text }
    ).pipe(catchError(this.handleError));
  }

  deleteComment(commentId: string): Observable<void> {
    return this.http.delete<void>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMMENTS}/${commentId}`
    ).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Errore con i commenti';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else if (error.status) {
      errorMessage = `Errore: ${error.status}. ${error.error?.message || ''}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
