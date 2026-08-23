import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CartService } from './cart.service';
import { Product } from '../models';

describe('CartService', () => {
  let service: CartService;

  const mockProduct: Product = {
    id: 1,
    title: 'Test Product',
    price: 10.99,
    description: 'Test description',
    category: 'test',
    image: 'https://example.com/image.jpg',
    rating: { rate: 4.5, count: 100 }
  };

  const mockProduct2: Product = {
    id: 2,
    title: 'Test Product 2',
    price: 25.50,
    description: 'Test description 2',
    category: 'test',
    image: 'https://example.com/image2.jpg',
    rating: { rate: 4.0, count: 50 }
  };

  beforeEach(() => {
    sessionStorage.clear();
    service = new CartService();
  });

  describe('addItem', () => {
    it('should add a new product to the cart', () => {
      service.addItem(mockProduct);

      expect(service.items().length).toBe(1);
      expect(service.items()[0].product.id).toBe(1);
      expect(service.items()[0].quantity).toBe(1);
    });

    it('should increase quantity when adding the same product', () => {
      service.addItem(mockProduct);
      service.addItem(mockProduct);

      expect(service.items().length).toBe(1);
      expect(service.items()[0].quantity).toBe(2);
    });

    it('should add different products as separate items', () => {
      service.addItem(mockProduct);
      service.addItem(mockProduct2);

      expect(service.items().length).toBe(2);
    });
  });

  describe('itemCount', () => {
    it('should return 0 for empty cart', () => {
      expect(service.itemCount()).toBe(0);
    });

    it('should return total quantity of all items', () => {
      service.addItem(mockProduct);
      service.addItem(mockProduct);
      service.addItem(mockProduct2);

      expect(service.itemCount()).toBe(3);
    });
  });

  describe('total', () => {
    it('should return 0 for empty cart', () => {
      expect(service.total()).toBe(0);
    });

    it('should calculate total correctly for single item', () => {
      service.addItem(mockProduct);
      service.addItem(mockProduct);

      expect(service.total()).toBe(21.98);
    });

    it('should calculate total correctly for multiple items', () => {
      service.addItem(mockProduct);
      service.addItem(mockProduct2);

      expect(service.total()).toBe(36.49);
    });

    it('should update total when quantity changes', () => {
      service.addItem(mockProduct);
      service.updateQuantity(1, 3);

      expect(service.total()).toBe(32.97);
    });
  });

  describe('removeItem', () => {
    it('should remove product from cart', () => {
      service.addItem(mockProduct);
      service.addItem(mockProduct2);
      service.removeItem(1);

      expect(service.items().length).toBe(1);
      expect(service.items()[0].product.id).toBe(2);
    });
  });

  describe('updateQuantity', () => {
    it('should update quantity correctly', () => {
      service.addItem(mockProduct);
      service.updateQuantity(1, 5);

      expect(service.items()[0].quantity).toBe(5);
    });

    it('should remove item when quantity is 0', () => {
      service.addItem(mockProduct);
      service.updateQuantity(1, 0);

      expect(service.items().length).toBe(0);
    });
  });

  describe('clear', () => {
    it('should remove all items from cart', () => {
      service.addItem(mockProduct);
      service.addItem(mockProduct2);
      service.clear();

      expect(service.items().length).toBe(0);
      expect(service.itemCount()).toBe(0);
      expect(service.total()).toBe(0);
    });
  });

  describe('persistence', () => {
    it('should persist cart to sessionStorage', () => {
      service.addItem(mockProduct);
      const stored = sessionStorage.getItem('cart_items');
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.length).toBe(1);
    });

    it('should load cart from sessionStorage on init', () => {
      service.addItem(mockProduct);
      const newService = new CartService();
      expect(newService.items().length).toBe(1);
    });
  });
});
