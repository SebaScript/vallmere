import { Injectable, computed, signal } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { Product } from '../interfaces/product.interface';
import { AuthService } from './auth.service';

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

  totalItems = computed(() => this.cartItems().reduce((total, item) => total + item.quantity, 0));
  totalAmount = computed(() => this.cartItems().reduce((total, item) => total + (item.quantity * item.product.price), 0));

  items = this.cartItems.asReadonly();

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {
    // Initialize cart for authenticated user or create a local cart
    this.initializeCart();
  }

  private initializeCart(): void {
    const user = this.authService.getCurrentUser();

    if (user) {
      // Try to get user's cart from API
      this.getUserCart(user.userId || 0).subscribe();
    } else {
      // Use local storage for anonymous users
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        try {
          const parsedCart = JSON.parse(localCart);
          this.cartItems.set(parsedCart);
        } catch (e) {
          console.error('Error parsing cart from localStorage', e);
          this.cartItems.set([]);
        }
      }
    }
  }

  getUserCart(userId: number): Observable<Cart | null> {
    return this.apiService.get<any>(`carts/user/${userId}`).pipe(
      tap(cart => {
        if (cart) {
          this.cartId.set(cart.cartId);
          this.cartItems.set(cart.items.map((item: any) => ({
            cartItemId: item.cartItemId,
            productId: item.productId,
            quantity: item.quantity,
            product: {
              id: item.product.productId,
              name: item.product.name,
              description: item.product.description,
              price: item.product.price,
              stock: item.product.stock,
              imageUrl: item.product.image,
              carouselUrl: item.product.carouselImages || [],
              category: item.product.category?.name || ''
            }
          })));
        }
      }),
      catchError(error => {
        // If cart not found, create a new one
        if (error.status === 404) {
          return this.createCart(userId).pipe(
            tap(newCart => {
              this.cartId.set(newCart.cartId);
              this.cartItems.set([]);
            }),
            map(() => null)
          );
        }
        return of(null);
      })
    );
  }

  private createCart(userId: number): Observable<Cart> {
    return this.apiService.post<Cart>('carts', { userId });
  }

  addToCart(product: Product, quantity: number = 1): Observable<CartItem | void> {
    const user = this.authService.getCurrentUser();

    if (user && this.cartId()) {
      // Add to backend cart
      return this.apiService.post<CartItem>(`carts/${this.cartId()}/items`, {
        productId: product.id,
        quantity
      }).pipe(
        tap(cartItem => {
          // Update local cart state
          const currentItems = this.cartItems();
          const existingItemIndex = currentItems.findIndex(item => item.productId === product.id);

          if (existingItemIndex >= 0) {
            // Update existing item
            const updatedItems = [...currentItems];
            updatedItems[existingItemIndex].quantity += quantity;
            this.cartItems.set(updatedItems);
          } else {
            // Add new item
            this.cartItems.update(items => [...items, {
              cartItemId: cartItem.cartItemId,
              productId: product.id,
              quantity,
              product
            }]);
          }
        })
      );
    } else {
      // Handle local storage for anonymous users
      const currentItems = this.cartItems();
      const existingItemIndex = currentItems.findIndex(item => item.productId === product.id);

      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex].quantity += quantity;
        this.cartItems.set(updatedItems);
      } else {
        // Add new item with a temporary ID
        this.cartItems.update(items => [
          ...items,
          {
            cartItemId: Date.now(), // Use timestamp as temporary ID
            productId: product.id,
            quantity,
            product
          }
        ]);
      }

      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(this.cartItems()));

      return of(undefined);
    }
  }

  removeFromCart(itemId: number): Observable<void> {
    const user = this.authService.getCurrentUser();

    if (user && this.cartId()) {
      // Remove from backend cart - using full endpoint with no separate ID needed
      return this.apiService.delete<void>(`carts/${this.cartId()}/items/${itemId}`).pipe(
        tap(() => {
          // Update local cart state
          this.cartItems.update(items => items.filter(item => item.cartItemId !== itemId));
        })
      );
    } else {
      // Handle local storage for anonymous users
      this.cartItems.update(items => items.filter(item => item.cartItemId !== itemId));
      localStorage.setItem('cart', JSON.stringify(this.cartItems()));
      return of(undefined);
    }
  }

  updateQuantity(itemId: number, quantity: number): Observable<void> {
    const user = this.authService.getCurrentUser();
    const currentItems = this.cartItems();
    const itemIndex = currentItems.findIndex(item => item.cartItemId === itemId);

    if (itemIndex === -1) {
      return of(undefined);
    }

    if (quantity <= 0) {
      return this.removeFromCart(itemId);
    }

    if (user && this.cartId()) {
      // For now, we'll remove and add since the backend doesn't have an update endpoint
      return this.removeFromCart(itemId).pipe(
        switchMap(() => {
          const item = currentItems[itemIndex];
          return this.addToCart(item.product, quantity);
        }),
        map(() => undefined)
      );
    } else {
      // Handle local storage for anonymous users
      const updatedItems = [...currentItems];
      updatedItems[itemIndex].quantity = quantity;
      this.cartItems.set(updatedItems);
      localStorage.setItem('cart', JSON.stringify(this.cartItems()));
      return of(undefined);
    }
  }

  clearCart(): Observable<void> {
    const user = this.authService.getCurrentUser();

    if (user && this.cartId()) {
      // Clear backend cart - using full endpoint with no ID needed
      return this.apiService.delete<void>(`carts/${this.cartId()}/items`);
    } else {
      // Handle local storage for anonymous users
      this.cartItems.set([]);
      localStorage.removeItem('cart');
      return of(undefined);
    }
  }

  // When a user logs in, this can be called to migrate their anonymous cart to their account
  migrateCart(): Observable<void> {
    const user = this.authService.getCurrentUser();
    const items = this.cartItems();

    if (!user || items.length === 0) {
      return of(undefined);
    }

    // Get or create user cart
    return this.getUserCart(user.userId || 0).pipe(
      switchMap(() => {
        // Add each item to the cart
        const addPromises = items.map(item =>
          this.addToCart(item.product, item.quantity)
        );

        // Once all items are added, clear local storage
        return of(undefined).pipe(
          tap(() => localStorage.removeItem('cart'))
        );
      })
    );
  }
}
