import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthPromptService {
  private loginRequestSubject = new Subject<void>();
  loginRequest$ = this.loginRequestSubject.asObservable();

  requestLogin() {
    this.loginRequestSubject.next();
  }
}
