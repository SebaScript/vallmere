import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  @Input() imageUrl!: string;
  @Input() title!: string;
  @Input() price!: number;
  @Input() productId!: string;

  constructor(private router: Router) {}

  goToDetails() {
    this.router.navigate(['/product', this.productId]);
  }
}
