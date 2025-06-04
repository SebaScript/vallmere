import { Injectable, computed, signal } from '@angular/core';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { catchError, tap, map, switchMap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { Product } from '../interfaces/product.interface';

// Backend product interface (as it comes from the API)
interface BackendProduct {
  productId: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  carouselImages: string[];
  category?: { name: string };
}

// Backend cart item interface
interface BackendCartItem {
  cartItemId: number;
  productId: number;
  quantity: number;
  product: BackendProduct;
}

// Backend cart interface
interface BackendCart {
  cartId: number;
  userId: number;
  items: BackendCartItem[];
}

export interface CartItem {
  cartItemId: number;
  productId: number;
  quantity: number;
  product: Product;
}

export interface Cart {
  cartId: number;
  userId: number;
  items: CartItem[];
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = signal<CartItem[]>([]);
  private cartId = signal<number | null>(null);
  private isLoading = signal<boolean>(false);

  totalItems = computed(() => this.cartItems().reduce((total, item) => total + item.quantity, 0));
  totalAmount = computed(() => this.cartItems().reduce((total, item) => total + (item.quantity * item.product.price), 0));

  items = this.cartItems.asReadonly();
  loading = this.isLoading.asReadonly();

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    // Initialize cart when user logs in
    this.authService.currentUser$.subscribe((user: any) => {
      if (user) {
        this.loadCart();
      } else {
        this.clearCartData();
      }
    });
  }

  private loadCart(): void {
    if (!this.authService.isUserLogged()) {
      return;
    }

    this.isLoading.set(true);
    this.apiService.get<BackendCart>('cart/my-cart').pipe(
      catchError(error => {
        console.error('Error loading cart:', error);
        this.toastr.error('Error loading cart', 'Cart Error');
        this.isLoading.set(false);
        return of(null);
      })
    ).subscribe(cart => {
      this.isLoading.set(false);
      if (cart) {
        this.cartId.set(cart.cartId);
                // Map backend product data to frontend format
        const mappedItems = cart.items?.map(item => ({
          ...item,
          product: {
            id: item.product.productId,
            name: item.product.name,
            description: item.product.description,
            price: item.product.price,
            stock: item.product.stock,
            imageUrl: item.product.image,
            carouselUrl: Array.isArray(item.product.carouselImages)
              ? item.product.carouselImages
              : [item.product.image],
            category: item.product.category?.name || 'Unknown'
          }
        })) || [];
        this.cartItems.set(mappedItems);
      }
    });
  }

  addToCart(product: Product, quantity: number = 1): Observable<CartItem | void> {
    if (!this.authService.isUserLogged()) {
      this.toastr.error('Please log in to add items to cart', 'Authentication Required');
      return throwError(() => new Error('User not logged in'));
    }

    const addItemDto = {
      productId: product.id,
      quantity: quantity
    };

    this.isLoading.set(true);
    return this.apiService.post<CartItem>('cart/add-item', addItemDto).pipe(
      tap(cartItem => {
        this.isLoading.set(false);
        this.loadCart(); // Reload cart to get updated data
        this.toastr.success(`${product.name} added to cart!`, 'Cart Updated');
      }),
      catchError(error => {
        this.isLoading.set(false);
        const errorMessage = error.error?.message || 'Failed to add item to cart';
        this.toastr.error(errorMessage, 'Cart Error');
        return throwError(() => error);
      })
    );
  }

  updateQuantity(itemId: number, quantity: number): Observable<void> {
    if (!this.cartId()) {
      return throwError(() => new Error('No cart available'));
    }

    if (quantity < 1) {
      return this.removeFromCart(itemId);
    }

    this.isLoading.set(true);
    return this.apiService.putWithoutId<CartItem>(`cart/${this.cartId()}/items/${itemId}/quantity`, { quantity }).pipe(
      tap(() => {
        this.isLoading.set(false);
        this.loadCart(); // Reload cart to get updated data
        this.toastr.success('Cart updated successfully', 'Cart Updated');
      }),
      map(() => void 0),
      catchError(error => {
        this.isLoading.set(false);
        const errorMessage = error.error?.message || 'Failed to update cart';
        this.toastr.error(errorMessage, 'Cart Error');
        return throwError(() => error);
      })
    );
  }

  removeFromCart(itemId: number): Observable<void> {
    if (!this.cartId()) {
      return throwError(() => new Error('No cart available'));
    }

    this.isLoading.set(true);
    return this.apiService.delete<void>(`cart/${this.cartId()}/items/${itemId}`).pipe(
      tap(() => {
        this.isLoading.set(false);
        this.loadCart(); // Reload cart to get updated data
        this.toastr.success('Item removed from cart', 'Cart Updated');
      }),
      catchError(error => {
        this.isLoading.set(false);
        const errorMessage = error.error?.message || 'Failed to remove item from cart';
        this.toastr.error(errorMessage, 'Cart Error');
        return throwError(() => error);
      })
    );
  }

  clearCart(): Observable<void> {
    if (!this.cartId()) {
      return throwError(() => new Error('No cart available'));
    }

    this.isLoading.set(true);
    return this.apiService.delete<void>(`cart/${this.cartId()}/clear`).pipe(
      tap(() => {
        this.isLoading.set(false);
        this.cartItems.set([]);
        this.toastr.success('Cart cleared successfully', 'Cart Updated');
      }),
      catchError(error => {
        this.isLoading.set(false);
        const errorMessage = error.error?.message || 'Failed to clear cart';
        this.toastr.error(errorMessage, 'Cart Error');
        return throwError(() => error);
      })
    );
  }

  getCartTotal(): Observable<{ itemCount: number; total: number }> {
    if (!this.cartId()) {
      return of({ itemCount: 0, total: 0 });
    }

    return this.apiService.get<{ itemCount: number; total: number }>(`cart/${this.cartId()}/total`);
  }

  private clearCartData(): void {
    this.cartItems.set([]);
    this.cartId.set(null);
  }

  // Method to refresh cart data
  refreshCart(): void {
    this.loadCart();
  }

  // Get current cart ID
  getCurrentCartId(): number | null {
    return this.cartId();
  }
}
