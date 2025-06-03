import { Injectable, signal } from '@angular/core';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '../interfaces/user.interface';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isAdminLogged = signal(false);
  isUserLogged = signal(false);

  public currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private router: Router,
    private toastr: ToastrService
  ) {
    // Check if we have a stored token and user
    this.checkLocalStorage();
  }

  private checkLocalStorage() {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('currentUser');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
        this.isUserLogged.set(true);
        this.isAdminLogged.set(user.role === 'admin');
      } catch (error) {
        console.error('Error parsing user data from localStorage', error);
        this.clearAuthData();
      }
    }
  }

  // Public method for clearing auth data (used by guards and logout)
  clearAuthData() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.isAdminLogged.set(false);
    this.isUserLogged.set(false);
  }

  login(loginData: LoginRequest): Observable<boolean> {
    return this.apiService.post<AuthResponse>('auth/login', loginData)
      .pipe(
        map(response => {
          if (response && response.access_token && response.user) {
            // Store token and user data
            localStorage.setItem('access_token', response.access_token);
            localStorage.setItem('currentUser', JSON.stringify(response.user));

            this.currentUserSubject.next(response.user);
            this.isUserLogged.set(true);
            this.isAdminLogged.set(response.user.role === 'admin');

            this.toastr.success('Welcome back!', 'Login Successful');
            return true;
          }
          return false;
        }),
        catchError(error => {
          console.error('Login error:', error);
          this.toastr.error(error.error?.message || 'Invalid credentials', 'Login Failed');
          return of(false);
        })
      );
  }

  register(registerData: RegisterRequest): Observable<boolean> {
    return this.apiService.post<AuthResponse>('auth/register', registerData)
      .pipe(
        map(response => {
          if (response && response.access_token && response.user) {
            // Store token and user data
            localStorage.setItem('access_token', response.access_token);
            localStorage.setItem('currentUser', JSON.stringify(response.user));

            this.currentUserSubject.next(response.user);
            this.isUserLogged.set(true);
            this.isAdminLogged.set(response.user.role === 'admin');

            this.toastr.success('Account created successfully!', 'Registration Successful');
            return true;
          }
          return false;
        }),
        catchError(error => {
          console.error('Registration error:', error);
          this.toastr.error(error.error?.message || 'User registration failed', 'Registration Failed');
          return of(false);
        })
      );
  }

  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/login']);
    this.toastr.success('You have been logged out', 'Logged Out');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    const user = this.currentUserSubject.value;
    return !!(token && user);
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return !!user && user.role === 'admin';
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Get current user profile from backend
  getProfile(): Observable<User> {
    return this.apiService.get<User>('auth/profile').pipe(
      tap(user => {
        if (user) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
      }),
      catchError(error => {
        console.error('Error getting profile:', error);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  // Update user profile
  updateProfile(userData: Partial<User>): Observable<User> {
    return this.apiService.patchWithoutId<User>('users/profile', userData).pipe(
      tap(user => {
        if (user) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
      }),
      catchError(error => {
        console.error('Error updating profile:', error);
        this.toastr.error(error.error?.message || 'Failed to update profile', 'Update Failed');
        return throwError(() => error);
      })
    );
  }

  // Legacy methods for backward compatibility
  adminLogin(email: string, password: string): Observable<boolean> {
    return this.login({ email, password });
  }

  userLogin(email: string, password: string): Observable<boolean> {
    return this.login({ email, password });
  }
}
