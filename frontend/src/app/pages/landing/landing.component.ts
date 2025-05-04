import { Component } from '@angular/core';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  imports: [ProductCardComponent, CommonModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  products = [
    {
      id: '1',
      name: 'Allstarz Sunglasses',
      price: 49.99,
      image: 'https://www.crtz.xyz/cdn/shop/files/Sunglasses_Yellow_02.png?v=1726478831'
    },
    {
      id: '2',
      name: 'Allstarz Socks',
      price: 29.99,
      image: 'https://www.crtz.xyz/cdn/shop/products/image_8d6da066-54b2-4388-927b-d5e1a5da5cec.png?v=1679066389'
    },
    {
      id: '3',
      name: 'Allstarz Contrast Hoodie',
      price: 29.99,
      image: 'https://www.crtz.xyz/cdn/shop/files/95RTWContstrastHoodie_BlackYellow_01.png?v=1741944335'
    },
    {
      id: '4',
      name: 'Premium Allstarz Trucker Cap',
      price: 29.99,
      image: 'https://www.crtz.xyz/cdn/shop/files/CRTZTruckerCap_BlackYellow_01_1.png?v=1702917901'
    },
    {
      id: '4',
      name: 'Nike Allstarz',
      price: 29.99,
      image: 'https://www.crtz.xyz/cdn/shop/files/FB2709-003_400730681_D_E_1X1_7b4d2a11-dfc1-455a-b02b-a682a1b6237f.png?v=1743515541'
    }
  ];
}
