import { Component, HostListener, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { ProductService } from '../../services/product.service';
import { User } from '../../interfaces/user.interface';
import { Product } from '../../interfaces/product.interface';

interface SearchProduct {
  id: number;
  name: string;
  imageUrl: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  @Input() cartCount: number = 0;
  query: string = '';
  results: SearchProduct[] = [];
  currentUser: User | null = null;
  isAuthenticated = false;
  isAdmin = false;
  private allProducts: Product[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private productService: ProductService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    // Subscribe to authentication state changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = this.authService.isAuthenticated();
      this.isAdmin = this.authService.isAdmin();
    });

    // Load products for search functionality
    this.loadProducts();
  }

  private loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.allProducts = products;
      },
      error: (error) => {
        console.error('Error loading products for search:', error);
      }
    });
  }

  onSearch(): void {
    if (!this.query.trim()) {
      this.results = [];
      return;
    }

    const q = this.query.toLowerCase();
    this.results = this.allProducts
      .filter(product =>
        product.name.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q)
      )
      .map(product => ({
        id: product.id,
        name: product.name,
        imageUrl: product.imageUrl
      }))
      .slice(0, 8); // Limit to 8 results for better UX
  }

  goToProduct(id: number): void {
    this.results = [];
    this.query = '';
    this.router.navigate(['/product', id]);
  }

  clearSearch(): void {
    this.query = '';
    this.results = [];
  }

  handleUserClick(): void {
    if (this.isAuthenticated) {
      this.router.navigate(['/profile']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  @HostListener('document:click', ['$event.target'])
  onOutsideClick(target: HTMLElement) {
    const clickedInside = target.closest('.search-container');
    if (!clickedInside) {
      this.clearSearch();
    }
  }
}
