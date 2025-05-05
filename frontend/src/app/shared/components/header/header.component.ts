import { Component, HostListener, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

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
export class HeaderComponent {
  @Input() cartCount: number = 0;
  query: string = '';
  results: SearchProduct[] = [];

  constructor(private router: Router) { }

  onSearch(): void {
    const stored = sessionStorage.getItem('products');
    if (!stored || !this.query.trim()) {
      this.results = [];
      return;
    }
    const products: SearchProduct[] = JSON.parse(stored);
    const q = this.query.toLowerCase();
    this.results = products.filter(p => p.name.toLowerCase().includes(q));
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

  @HostListener('document:click', ['$event.target'])
  onOutsideClick(target: HTMLElement) {
    const clickedInside = target.closest('.search-container');
    if (!clickedInside) {
      this.clearSearch();
    }
  }
}
