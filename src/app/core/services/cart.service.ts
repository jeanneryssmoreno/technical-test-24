import { Injectable, signal, computed } from '@angular/core';
import { CartItem, Product } from '../models';

const CART_KEY = 'cart_items';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private itemsSignal = signal<CartItem[]>(this.loadFromStorage());

  readonly items = this.itemsSignal.asReadonly();
  readonly itemCount = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.quantity, 0)
  );
  readonly total = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  );

  addItem(product: Product): void {
    const current = this.itemsSignal();
    const existing = current.find(item => item.product.id === product.id);

    if (existing) {
      this.itemsSignal.set(
        current.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      this.itemsSignal.set([...current, { product, quantity: 1 }]);
    }
    this.saveToStorage();
  }

  addItemWithQuantity(product: Product, quantity: number): void {
    const current = this.itemsSignal();
    const existing = current.find(item => item.product.id === product.id);

    if (existing) {
      this.itemsSignal.set(
        current.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      this.itemsSignal.set([...current, { product, quantity }]);
    }
    this.saveToStorage();
  }

  removeItem(productId: number): void {
    this.itemsSignal.set(
      this.itemsSignal().filter(item => item.product.id !== productId)
    );
    this.saveToStorage();
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    this.itemsSignal.set(
      this.itemsSignal().map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
    this.saveToStorage();
  }

  clear(): void {
    this.itemsSignal.set([]);
    this.saveToStorage();
  }

  private saveToStorage(): void {
    sessionStorage.setItem(CART_KEY, JSON.stringify(this.itemsSignal()));
  }

  private loadFromStorage(): CartItem[] {
    try {
      const stored = sessionStorage.getItem(CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}
