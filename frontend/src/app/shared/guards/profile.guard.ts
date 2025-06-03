import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, catchError, of } from 'rxjs';

export const profileGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Check if user is authenticated locally first
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // If user appears to be authenticated, validate token with backend
  return authService.getProfile().pipe(
    map(() => {
      // If profile request succeeds, user is authenticated
      return true;
    }),
    catchError(() => {
      // If profile request fails (401), token is expired - logout silently
      authService.clearAuthData();
      router.navigate(['/login']);
      return of(false);
    })
  );
};
