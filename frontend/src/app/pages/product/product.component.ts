import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductDetailComponent implements OnInit {
  images: string[] = [];
  currentImageIndex = 0;

  product: any = null;
  selectedSize: string = 'M';
  sizes: string[] = ['XS', 'S', 'M', 'L', 'XL'];

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(paramMap => {
      const productId = paramMap.get('id');
      const productsJSON = sessionStorage.getItem('products');
      const products = productsJSON ? JSON.parse(productsJSON) : [];

      const found = products.find((p: any) => String(p.id) === productId);
      console.log('Algo', productsJSON);
      console.log('Algo', products);

      if (found) {
        this.product = found;
      } else {
        console.warn('Producto no encontrado');
      }
    });
  }

  changeImage(direction: 'prev' | 'next') {
    if (!this.product.carrouselUrl) return;

    if (direction === 'prev') {
      this.currentImageIndex = (this.currentImageIndex + this.product.carrouselUrl.length - 1) % this.product.carrouselUrl.length;
    } else {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.product.carrouselUrl.length;
    }
  }
}
