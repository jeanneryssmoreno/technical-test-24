import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FavoritesService } from '../../core/services/favorites.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { ProductCardComponent } from '../../shared/components/product-card.component';
import { IconComponent } from '../../shared/components/icon.component';
import { Product } from '../../core/models';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [RouterLink, ProductCardComponent, IconComponent],
  template: `
    <div class="w-full max-w-[1280px] mx-auto px-4 md:px-16 py-8 mb-20 md:mb-0">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-on-surface">
          {{ i18n.t().favorites.title }}
        </h1>
        @if (favoritesService.count() > 0) {
          <button
            (click)="clearAll()"
            class="text-sm text-error hover:text-error/80 transition-colors"
          >
            {{ i18n.t().favorites.clearAll }}
          </button>
        }
      </div>

      @if (favoritesService.count() === 0) {
        <div class="flex flex-col items-center justify-center py-20">
          <app-icon name="favorite_border" [size]="120" class="text-outline-variant mb-6" />
          <h2 class="text-2xl font-semibold text-on-surface mb-2">
            {{ i18n.t().favorites.emptyTitle }}
          </h2>
          <p class="text-on-surface-variant mb-8 text-center max-w-md">
            {{ i18n.t().favorites.emptyMessage }}
          </p>
          <a
            routerLink="/catalog"
            class="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <app-icon name="shopping_bag" [size]="20" />
            {{ i18n.t().favorites.exploreProducts }}
          </a>
        </div>
      } @else {
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          @for (product of favoritesService.favorites(); track product.id) {
            <div class="relative">
              <app-product-card
                [product]="product"
                (addToCart)="addToCart($event)"
                (favorite)="onFavorite($event)"
              />
            </div>
          }
        </div>
      }
    </div>
  `
})
export class FavoritesComponent {
  protected favoritesService = inject(FavoritesService);
  private cartService = inject(CartService);
  private toastService = inject(ToastService);
  protected i18n = inject(I18nService);

  addToCart(product: Product): void {
    this.cartService.addItem(product);
    this.toastService.success(this.i18n.t().cart.addedToCart);
  }

  onFavorite(product: Product): void {
    if (!this.favoritesService.isFavorite(product.id)) {
      this.toastService.info(this.i18n.t().favorites.removedFromFavorites);
    }
  }

  clearAll(): void {
    this.favoritesService.clear();
    this.toastService.success(this.i18n.t().favorites.allCleared);
  }
}
