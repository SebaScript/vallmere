import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, map, catchError, throwError } from 'rxjs';
import { Product } from '../interfaces/product.interface';
import { CategoryService } from './category.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private endpoint = 'products';

  constructor(
    private apiService: ApiService,
    private categoryService: CategoryService
  ) {}

  getAllProducts(): Observable<Product[]> {
    return this.apiService.get<any[]>(this.endpoint)
      .pipe(
        map(products => this.mapToFrontendProducts(products)),
        catchError(error => {
          console.error('Error fetching products:', error);
          return throwError(() => error);
        })
      );
  }

  getProductById(id: number): Observable<Product> {
    return this.apiService.getById<any>(this.endpoint, id)
      .pipe(
        map(product => this.mapToFrontendProduct(product)),
        catchError(error => {
          console.error('Error fetching product:', error);
          return throwError(() => error);
        })
      );
  }

  createProduct(product: any): Observable<Product> {
    console.log('Creating product with data:', product);

    const backendProduct = {
      name: product.name,
      description: product.description,
      price: Number(product.price),
      stock: Number(product.stock),
      image: product.imageUrl,
      carouselImages: Array.isArray(product.carouselUrl) ? product.carouselUrl : [product.imageUrl],
      categoryId: Number(product.categoryId) // Now expects categoryId directly
    };

    console.log('Sending to backend:', backendProduct);

    return this.apiService.post<any>(this.endpoint, backendProduct)
      .pipe(
        map(product => this.mapToFrontendProduct(product)),
        catchError(error => {
          console.error('Error creating product:', error);
          return throwError(() => error);
        })
      );
  }

  updateProduct(id: number, product: any): Observable<Product> {
    console.log('Updating product with data:', product);

    const backendProduct: any = {};

    if (product.name) backendProduct.name = product.name;
    if (product.description) backendProduct.description = product.description;
    if (product.price) backendProduct.price = Number(product.price);
    if (product.stock !== undefined) backendProduct.stock = Number(product.stock);
    if (product.imageUrl) backendProduct.image = product.imageUrl;
    if (product.carouselUrl) {
      backendProduct.carouselImages = Array.isArray(product.carouselUrl) ? product.carouselUrl : [product.imageUrl];
    }
    if (product.categoryId) backendProduct.categoryId = Number(product.categoryId);

    console.log('Sending to backend:', backendProduct);

    return this.apiService.patch<any>(this.endpoint, id, backendProduct)
      .pipe(
        map(product => this.mapToFrontendProduct(product)),
        catchError(error => {
          console.error('Error updating product:', error);
          return throwError(() => error);
        })
      );
  }

  deleteProduct(id: number): Observable<void> {
    return this.apiService.delete<void>(this.endpoint, id)
      .pipe(
        catchError(error => {
          console.error('Error deleting product:', error);
          return throwError(() => error);
        })
      );
  }

  // Helper methods to map backend data to frontend format
  private mapToFrontendProduct(product: any): Product {
    return {
      id: product.productId,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      stock: Number(product.stock),
      imageUrl: product.image,
      carouselUrl: Array.isArray(product.carouselImages) ? product.carouselImages : [product.image],
      category: product.category?.name || 'Unknown'
    };
  }

  private mapToFrontendProducts(products: any[]): Product[] {
    return products.map(product => this.mapToFrontendProduct(product));
  }
}
