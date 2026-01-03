import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { Meme } from '../models/meme';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  constructor(private http: HttpClient) {}

  uploadMeme(formData: FormData): Observable<Meme> {
    return this.http.post<Meme>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MEMES}`,
      formData
    );
  }
}
