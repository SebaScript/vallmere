import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (!authService.isAdminLogged()) {
    authService.logout();
    router.navigateByUrl('admin-login');
    return false;
  }

  return true;
};
