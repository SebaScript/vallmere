import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Get the user from localStorage
  const userData = localStorage.getItem('currentUser');
  
  // If we have user data with a token, add it to the request
  if (userData) {
    try {
      const user = JSON.parse(userData);
      if (user && user.token) {
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${user.token}`,
          },
        });
      }
    } catch (e) {
      console.error('Error parsing user data from localStorage', e);
    }
  }
  
  return next(req);
} 