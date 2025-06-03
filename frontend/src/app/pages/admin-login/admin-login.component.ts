import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-admin-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css'
})
export class AdminLoginComponent {
  router = inject(Router);
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  toastr = inject(ToastrService);

  loading = false;
  error: string | null = null;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  onLogin() {
    if (this.loginForm.invalid) {
      this.toastr.error('Please fill all fields correctly', 'Invalid Form');
      return;
    }

    this.loading = true;
    this.error = null;

    const { email, password } = this.loginForm.value;

    this.authService.adminLogin(email!, password!).subscribe({
      next: (success) => {
        this.loading = false;
        if (success) {
          this.router.navigateByUrl('admin');
        } else {
          this.error = 'Invalid credentials or not an admin account';
        }
      },
      error: (err) => {
        console.error('Login error', err);
        this.loading = false;
        this.error = 'Login failed. Please try again.';
      }
    });
  }
}
