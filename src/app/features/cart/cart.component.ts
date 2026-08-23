import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, NgClass } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { IconComponent } from '../../shared/components/icon.component';
import { I18nService } from '../../core/i18n/i18n.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CurrencyPipe, NgClass, RouterLink, EmptyStateComponent, IconComponent],
  template: `
    <main class="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-16 py-12 mb-20 md:mb-0">
      
      <h2 class="font-headline text-4xl md:text-5xl text-primary mb-6 text-center">
        {{ i18n.t().cart.title }}
      </h2>

      @if (cartService.items().length === 0) {
        <app-empty-state
          [title]="i18n.t().cart.empty"
          [message]="i18n.t().cart.emptyMessage"
        />
        <div class="text-center mt-6">
          <a
            routerLink="/catalog"
            class="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-opacity hover:opacity-90"
          >
            <app-icon name="arrow_back" [size]="18" />
            {{ i18n.t().cart.backToCatalog }}
          </a>
        </div>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- Items List -->
          <div class="lg:col-span-8 flex flex-col gap-3">
            @for (item of cartService.items(); track item.product.id) {
              <div 
                class="flex items-center gap-4 py-4 border-b border-outline-variant/30 animate-fade-in"
                [ngClass]="{ 'animate-fade-out': removingId() === item.product.id }"
              >
                <img 
                  class="w-24 h-32 object-contain p-2 rounded bg-surface-container-low"
                  [src]="item.product.image" 
                  [alt]="item.product.title"
                  loading="lazy"
                />
                <div class="flex-grow flex flex-col justify-between h-32 py-1">
                  <div>
                    <div class="flex justify-between items-start">
                      <div>
                        <h3 class="font-bold text-sm uppercase tracking-wider text-primary">
                          {{ item.product.title }}
                        </h3>
                        <p class="text-sm text-on-surface-variant mt-1">
                          {{ i18n.translateCategory(item.product.category) }}
                        </p>
                      </div>
                      <button 
                        (click)="removeItem(item.product.id)"
                        class="text-on-surface-variant hover:text-error transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <app-icon name="close" [size]="20" />
                      </button>
                    </div>
                  </div>
                  <div class="flex justify-between items-end">
                    <div class="flex items-center border border-outline-variant/50 rounded p-1 gap-4">
                      <button 
                        (click)="decreaseQuantity(item.product.id)"
                        class="text-on-surface-variant px-1 hover:text-primary transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <app-icon name="remove" [size]="16" />
                      </button>
                      <span class="text-sm text-primary font-medium">
                        {{ item.quantity }}
                      </span>
                      <button 
                        (click)="increaseQuantity(item.product.id)"
                        class="text-on-surface-variant px-1 hover:text-primary transition-colors"
                        aria-label="Increase quantity"
                      >
                        <app-icon name="add" [size]="16" />
                      </button>
                    </div>
                    <span class="font-bold text-sm uppercase tracking-wider text-primary">
                      {{ item.product.price * item.quantity | currency:'USD':'symbol':'1.2-2' }}
                    </span>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Order Summary -->
          <div class="lg:col-span-4 mt-6 lg:mt-0">
            <div class="bg-surface-container-lowest p-6 rounded-xl ambient-shadow-lvl2">
              <h3 class="font-headline text-2xl text-primary mb-6">
                {{ i18n.t().cart.orderSummary }}
              </h3>
              <div class="flex flex-col gap-4 text-base text-on-surface-variant mb-6">
                <div class="flex justify-between">
                  <span>{{ i18n.t().cart.subtotal }}</span>
                  <span class="text-primary font-medium">
                    {{ cartService.total() | currency:'USD':'symbol':'1.2-2' }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span>{{ i18n.t().cart.shipping }}</span>
                  <span class="text-primary font-medium">{{ i18n.t().cart.free }}</span>
                </div>
              </div>
              <div class="border-t border-outline-variant/30 pt-4 flex justify-between items-end mb-8">
                <span class="font-bold text-sm uppercase tracking-wider text-primary">
                  {{ i18n.t().cart.total }}
                </span>
                <span class="font-headline text-2xl text-primary">
                  {{ cartService.total() | currency:'USD':'symbol':'1.2-2' }}
                </span>
              </div>
              <button
                (click)="goToCheckout()"
                class="w-full bg-primary text-on-primary py-4 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-primary-container transition-colors"
              >
                {{ i18n.t().cart.checkout }}
              </button>
              <a
                routerLink="/catalog"
                class="block text-center text-sm text-on-surface-variant hover:text-primary mt-4 font-medium transition-colors"
              >
                {{ i18n.t().cart.continueShopping }}
              </a>
            </div>
          </div>

        </div>
      }
    </main>
  `
})
export class CartComponent {
  protected cartService = inject(CartService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  protected i18n = inject(I18nService);

  removingId = signal<number | null>(null);

  goToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  removeItem(productId: number): void {
    this.removingId.set(productId);
    setTimeout(() => {
      this.cartService.removeItem(productId);
      this.toastService.success(this.i18n.t().cart.itemRemoved);
      this.removingId.set(null);
    }, 300);
  }

  increaseQuantity(productId: number): void {
    const item = this.cartService.items().find(i => i.product.id === productId);
    if (item) {
      this.cartService.updateQuantity(productId, item.quantity + 1);
    }
  }

  decreaseQuantity(productId: number): void {
    const item = this.cartService.items().find(i => i.product.id === productId);
    if (item && item.quantity > 1) {
      this.cartService.updateQuantity(productId, item.quantity - 1);
    }
  }
}
