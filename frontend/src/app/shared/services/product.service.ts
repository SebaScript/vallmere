import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, map } from 'rxjs';
import { Product } from '../interfaces/product.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private endpoint = 'products';

  constructor(private apiService: ApiService) {}

  getAllProducts(): Observable<Product[]> {
    return this.apiService.get<any[]>(this.endpoint)
      .pipe(
        map(products => this.mapToFrontendProducts(products))
      );
  }

  getProductById(id: number): Observable<Product> {
    return this.apiService.getById<any>(this.endpoint, id)
      .pipe(
        map(product => this.mapToFrontendProduct(product))
      );
  }

  createProduct(product: Omit<Product, 'id'>): Observable<Product> {
    const backendProduct = {
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      image: product.imageUrl,
      carouselImages: product.carouselUrl,
      categoryId: this.getCategoryId(product.category)
    };

    return this.apiService.post<any>(this.endpoint, backendProduct)
      .pipe(
        map(product => this.mapToFrontendProduct(product))
      );
  }

  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    const backendProduct: any = {};

    if (product.name) backendProduct.name = product.name;
    if (product.description) backendProduct.description = product.description;
    if (product.price) backendProduct.price = product.price;
    if (product.stock) backendProduct.stock = product.stock;
    if (product.imageUrl) backendProduct.image = product.imageUrl;
    if (product.carouselUrl) backendProduct.carouselImages = product.carouselUrl;
    if (product.category) backendProduct.categoryId = this.getCategoryId(product.category);

    return this.apiService.patch<any>(this.endpoint, id, backendProduct)
      .pipe(
        map(product => this.mapToFrontendProduct(product))
      );
  }

  deleteProduct(id: number): Observable<void> {
    return this.apiService.delete<void>(this.endpoint, id);
  }

  // Helper methods to map backend data to frontend format
  private mapToFrontendProduct(product: any): Product {
    return {
      id: product.productId,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      imageUrl: product.image,
      carouselUrl: product.carouselImages,
      category: product.category?.name || ''
    };
  }

  private mapToFrontendProducts(products: any[]): Product[] {
    return products.map(product => this.mapToFrontendProduct(product));
  }

  // Simple mapping from category name to categoryId
  // In a real application, this would fetch the categories from the backend
  private getCategoryId(categoryName: string): number {
    const categoryMap: Record<string, number> = {
      'T-shirts': 1,
      'Hoodies': 2,
      'Bottoms': 3,
      'Hats': 4,
      'Accesories': 5
    };
    return categoryMap[categoryName] || 1; // Default to 1 if not found
  }
}
