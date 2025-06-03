import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

declare global {
  interface Window {
    google: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class OAuthService {
  constructor(private router: Router) {}

  // Initialize Google OAuth
  initializeGoogleSignIn(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && window.google) {
        resolve();
        return;
      }

      // Load Google APIs script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        resolve();
      };
      script.onerror = () => {
        reject(new Error('Failed to load Google Sign-In script'));
      };
      document.head.appendChild(script);
    });
  }

  // Handle Google Sign-In
  async signInWithGoogle(): Promise<void> {
    try {
      await this.initializeGoogleSignIn();

      // Redirect to backend OAuth endpoint
      const backendUrl = environment.apiUrl || 'http://localhost:3000';
      window.location.href = `${backendUrl}/auth/google`;
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      throw error;
    }
  }

  // Parse OAuth callback parameters
  parseCallbackParams(): { token: string | null, user: any | null } {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userParam = urlParams.get('user');

    let user = null;
    if (userParam) {
      try {
        user = JSON.parse(decodeURIComponent(userParam));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    return { token, user };
  }
}
