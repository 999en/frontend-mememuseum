import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('Making request to:', req.url);
  
  const token = localStorage.getItem('token');
  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    console.log('Added token to request');
    return next(cloned).pipe(
      tap(response => {
        console.log('Response received:', response);
      })
    );
  }
  
  return next(req).pipe(
    tap(response => {
      console.log('Response received:', response);
    })
  );
};
