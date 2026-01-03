import { HttpInterceptorFn } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('🔍 Interceptor - Making request to:', req.url);
  
  const token = localStorage.getItem('token');
  console.log('🔑 Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
  
  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    console.log('✅ Token added to request headers');
    console.log('📤 Request headers:', cloned.headers.get('Authorization'));
    
    return next(cloned).pipe(
      tap(response => {
        console.log('✅ Response received successfully');
      }),
      catchError(error => {
        console.error('❌ Request failed:', error);
        console.error('❌ Error status:', error.status);
        console.error('❌ Error message:', error.error);
        return throwError(() => error);
      })
    );
  }
  
  console.log('⚠️ No token found, request sent without Authorization header');
  return next(req).pipe(
    tap(response => {
      console.log('✅ Response received (no auth)');
    }),
    catchError(error => {
      console.error('❌ Request failed (no auth):', error);
      return throwError(() => error);
    })
  );
};
