import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { CommonModule } from '@angular/common';
import { LoggerService } from './core/services/logger.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  itemsInCart = 0;
  
  constructor(
    public router: Router,
    private logger: LoggerService
  ) {}

  ngOnInit(): void {
    this.logger.info('Application started', { app: 'Vallmere Frontend' });
    
    // Test various log levels
    setTimeout(() => {
      this.logger.debug('Debug message from frontend');
      this.logger.info('Info message from frontend');
      this.logger.warn('Warning message from frontend');
      this.logger.error('Error message from frontend', { errorCode: 'TEST-001' });
    }, 2000);
  }

  get isLoginRoute(): boolean {
    return this.router.url === '/login' || this.router.url === '/admin-login' || this.router.url === '/admin' || this.router.url === '/profile' || this.router.url === '/sign-up';
  }
}
