import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { Admin } from '../../shared/interfaces/admin.interface';

@Component({
  selector: 'app-admin-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css'
})
export class AdminLoginComponent {
  router = inject(Router);

  fb = inject(FormBuilder);

  authService = inject(AuthService);

  loginForm = this.fb.group({
    username:['', [Validators.required, Validators.minLength(4)]],
    password:['', [Validators.required]]
  })

  ngOnInit(){
    const admin: Admin = { username: 'admin', password: 'admin' };
    localStorage.setItem('admin', JSON.stringify(admin));
  }

  onLogin(){
    if(this.loginForm.invalid){
      alert('Invalid form, please fill all fields correctly.');
      return;
    }
    const {username, password } = this.loginForm.value;

    const success = this.authService.adminLogin(username!, password!);

    if (success){
      this.router.navigateByUrl('admin');
    }
  }
}
