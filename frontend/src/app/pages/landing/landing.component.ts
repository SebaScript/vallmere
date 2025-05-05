import { Component, computed, signal } from '@angular/core';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { CommonModule } from '@angular/common';
import { Product } from '../../shared/interfaces/product.interface';
import { CategoryService } from '../../shared/services/category.service';

@Component({
  selector: 'app-landing',
  imports: [ProductCardComponent, CommonModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  private allProducts = signal<Product[]>([]);

  filteredProducts = computed(() => {
    const cat = this.catSvc.selectedCategory();
    return this.allProducts()
      .filter(p => p.stock > 0)
      .filter(p => !cat || cat === 'New' ? true : p.category === cat);
    });

  constructor(private catSvc: CategoryService) {}

  ngOnInit() {
    const data = sessionStorage.getItem('products');
    const arr: Product[] = data ? JSON.parse(data) : this.initializeProducts();
    this.allProducts.set(arr);
  }

  // TEMPORAL PRODUCTOS QUEMADOS PARA PROBAR
  private initializeProducts() {
    let products: Product[] = [
      {
        id: 1,
        name: 'Allstarz Sunglasses',
        description: 'Stylish sunglasses for all occasions.',
        category: 'Accesories',
        stock: 10,
        price: 49.99,
        imageUrl: 'https://www.crtz.xyz/cdn/shop/files/Sunglasses_Yellow_02.png?v=1726478831'
      },
      {
        id: 2,
        name: 'Allstarz Socks',
        description: 'Stylish sunglasses for all occasions.',
        category: 'Bottoms',
        stock: 10,
        price: 29.99,
        imageUrl: 'https://www.crtz.xyz/cdn/shop/products/image_8d6da066-54b2-4388-927b-d5e1a5da5cec.png?v=1679066389'
      },
      {
        id: 3,
        name: 'Allstarz Contrast Hoodie',
        description: 'Stylish sunglasses for all occasions.',
        category: 'Hoodies',
        stock: 10,
        price: 69.99,
        imageUrl: 'https://www.crtz.xyz/cdn/shop/files/95RTWContstrastHoodie_BlackYellow_01.png?v=1741944335'
      },
      {
        id: 4,
        name: 'Premium Allstarz Trucker Cap',
        description: 'Stylish sunglasses for all occasions.',
        category: 'Hats',
        stock: 10,
        price: 19.99,
        imageUrl: 'https://www.crtz.xyz/cdn/shop/files/CRTZTruckerCap_BlackYellow_01_1.png?v=1702917901'
      },
      {
        id: 5,
        name: 'Nike Allstarz',
        description: 'Stylish sunglasses for all occasions.',
        category: 'Bottoms',
        stock: 10,
        price: 179.99,
        imageUrl: 'https://www.crtz.xyz/cdn/shop/files/FB2709-003_400730681_D_E_1X1_7b4d2a11-dfc1-455a-b02b-a682a1b6237f.png?v=1743515541'
      },
      {
        id: 6,
        name: 'Black Allstarz Cap',
        description: 'Stylish sunglasses for all occasions.',
        category: 'Hats',
        stock: 10,
        price: 19.99,
        imageUrl: 'https://www.crtz.xyz/cdn/shop/files/LiteworkCap_Black_01.png?v=1738230492'
      },
      {
        id: 7,
        name: 'Mesh RTW Shorts',
        description: 'Stylish sunglasses for all occasions.',
        category: 'Bottoms',
        stock: 10,
        price: 29.99,
        imageUrl: 'https://www.crtz.xyz/cdn/shop/files/RTWMESHSHORTS_BLACK_01.png?v=1721727314'
      },
      {
        id: 8,
        name: 'Reversible 95 Men Shirt',
        description: 'Stylish sunglasses for all occasions.',
        category: 'T-shirts',
        stock: 10,
        price: 69.99,
        imageUrl: 'https://www.crtz.xyz/cdn/shop/files/jerseydouble.png?v=1745928740'
      },
    ];
    sessionStorage.setItem('products', JSON.stringify(products));
    return products;
  }
}
