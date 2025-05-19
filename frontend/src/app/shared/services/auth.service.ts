import { Injectable, signal } from '@angular/core';
import { User } from '../interfaces/user.interface';
import Swal from 'sweetalert2';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isAdminLogged = signal(false);
  isUserLogged = signal(false);

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    // Check if we have a stored token
    this.checkLocalStorage();
  }

  private checkLocalStorage() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      const user = JSON.parse(userData);
      this.currentUserSubject.next(user);
      this.isUserLogged.set(true);
      this.isAdminLogged.set(user.role === 'admin');
    }
  }

  adminLogin(email: string, password: string): Observable<boolean> {
    return this.apiService.post<any>('auth/login', { email, password })
      .pipe(
        map(response => {
          if (response && response.role === 'admin') {
            localStorage.setItem('currentUser', JSON.stringify(response));
            this.currentUserSubject.next(response);
            this.isAdminLogged.set(true);
            this.isUserLogged.set(true);
            return true;
          }
          return false;
        }),
        catchError(() => {
          Swal.fire({
            title: 'Error',
            text: 'Invalid credentials',
            icon: 'error',
          });
          return of(false);
        })
      );
  }

  userLogin(usernameOrEmail: string, password: string): Observable<boolean> {
    return this.apiService.post<any>('auth/login', { email: usernameOrEmail, password })
      .pipe(
        map(response => {
          if (response) {
            localStorage.setItem('currentUser', JSON.stringify(response));
            this.currentUserSubject.next(response);
            this.isUserLogged.set(true);
            this.isAdminLogged.set(response.role === 'admin');
            return true;
          }
          return false;
        }),
        catchError(() => {
          Swal.fire({
            title: 'Error',
            text: 'Invalid credentials',
            icon: 'error',
          });
          return of(false);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.isAdminLogged.set(false);
    this.isUserLogged.set(false);
    this.router.navigate(['/login']);
  }

  register(user: User): Observable<boolean> {
    return this.apiService.post<any>('auth/register', {
      name: user.username,
      email: user.email,
      password: user.password
    }).pipe(
      map(response => {
        if (response) {
          localStorage.setItem('currentUser', JSON.stringify(response));
          this.currentUserSubject.next(response);
          this.isUserLogged.set(true);
          return true;
        }
        return false;
      }),
      catchError(error => {
        Swal.fire({
          title: 'Error',
          text: error.error?.message || 'User registration failed',
          icon: 'error',
        });
        return of(false);
      })
    );
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return !!user && user.role === 'admin';
  }
}
