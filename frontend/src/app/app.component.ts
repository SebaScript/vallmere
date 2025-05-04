import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  itemsInCart = 0;
  constructor(public router: Router) {}

  get isLoginRoute(): boolean {
    return this.router.url === '/login' || this.router.url === '/admin-login' || this.router.url === '/admin' || this.router.url === '/profile' || this.router.url === '/sign-up';
  }
}
