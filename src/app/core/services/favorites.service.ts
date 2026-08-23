import { Injectable, signal, computed, effect } from '@angular/core';
import { Product } from '../models/product.model';

const FAVORITES_KEY = 'favorites';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private favoritesSignal = signal<Product[]>(this.loadFromStorage());

  readonly favorites = this.favoritesSignal.asReadonly();
  readonly count = computed(() => this.favoritesSignal().length);

  constructor() {
    effect(() => {
      this.saveToStorage(this.favoritesSignal());
    });
  }

  isFavorite(productId: number): boolean {
    return this.favoritesSignal().some(p => p.id === productId);
  }

  toggle(product: Product): void {
    const current = this.favoritesSignal();
    const exists = current.some(p => p.id === product.id);

    if (exists) {
      this.favoritesSignal.set(current.filter(p => p.id !== product.id));
    } else {
      this.favoritesSignal.set([...current, product]);
    }
  }

  add(product: Product): void {
    if (!this.isFavorite(product.id)) {
      this.favoritesSignal.update(favs => [...favs, product]);
    }
  }

  remove(productId: number): void {
    this.favoritesSignal.update(favs => favs.filter(p => p.id !== productId));
  }

  clear(): void {
    this.favoritesSignal.set([]);
  }

  private saveToStorage(favorites: Product[]): void {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  }

  private loadFromStorage(): Product[] {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
      return [];
    }
  }
}
