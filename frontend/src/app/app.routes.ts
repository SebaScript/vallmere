import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LandingComponent } from './pages/landing/landing.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AdminComponent } from './pages/admin/admin.component';
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { AuthCallbackComponent } from './pages/auth-callback/auth-callback.component';
import { authGuard, adminGuard } from './shared/guards/auth.guard';
import { profileGuard } from './shared/guards/profile.guard';
import { ProductDetailComponent } from './pages/product/product.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'sign-up',
    component: SignUpComponent
  },
  {
    path: 'auth/callback',
    component: AuthCallbackComponent
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [profileGuard]
  },
  {
    path: 'product/:id',
    component: ProductDetailComponent
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'admin-login',
    component: AdminLoginComponent
  },
  {
    path:'**', redirectTo: '', pathMatch:'full'
  }
];
