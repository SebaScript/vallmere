// sign-up.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { User } from '../../shared/interfaces/user.interface';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent implements OnInit {
  signUpForm!: FormGroup;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.signUpForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rePassword: ['', Validators.required],
    }, { validators: this.passwordsMatch });
  }

  private passwordsMatch(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('password')?.value;
    const repass = group.get('rePassword')?.value;
    return pass === repass ? null : { passwordsNotMatch: true };
  }

  get f() {
    return this.signUpForm.controls;
  }

  onSignUp(): void {
    this.submitted = true;

    if (this.signUpForm.invalid) {
      return;
    }

    const newUser: User = {
      username: this.f['username'].value.trim(),
      email: this.f['email'].value.trim().toLowerCase(),
      password: this.f['password'].value
    };

    const raw = sessionStorage.getItem('users');
    const users: User[] = raw ? JSON.parse(raw) : [];

    const exists = users.some(u =>
      u.username === newUser.username || u.email === newUser.email
    );
    if (exists) {
      alert('User or email already exists!');
      return;
    }

    users.push(newUser);
    sessionStorage.setItem('users', JSON.stringify(users));

    this.authService.userLogin(newUser.username, newUser.password);
    this.router.navigate(['/profile']);
  }
}
