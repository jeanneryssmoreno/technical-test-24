import { Component, inject, input, output, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../../core/models/product.model';
import { IconComponent } from './icon.component';
import { I18nService } from '../../core/i18n/i18n.service';
import { FavoritesService } from '../../core/services/favorites.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, IconComponent],
  template: `
    <article class="group cursor-pointer" [routerLink]="['/product', product().id]">
      <div class="relative overflow-hidden rounded-xl mb-2 md:mb-3 bg-surface-container-lowest ambient-shadow-lvl1 aspect-square">
        <img 
          [src]="product().image" 
          [alt]="product().title"
          loading="lazy"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
        />
        <button 
          type="button"
          (click)="onFavorite($event)"
          class="hidden md:block absolute top-2 md:top-3 right-2 md:right-3 p-1.5 md:p-2 bg-surface/90 backdrop-blur-sm rounded-full text-on-surface transition-all duration-300 hover:bg-error hover:text-white z-10"
          [class.text-error]="isFavorite()"
          [class.bg-error/10]="isFavorite()"
          aria-label="Toggle favorite"
        >
          <app-icon name="favorite" [size]="18" [fill]="isFavorite()" />
        </button>
        <div class="hidden md:block absolute bottom-2 md:bottom-3 left-2 md:left-3 right-2 md:right-3">
          <button 
            type="button"
            (click)="onAddToCart($event)"
            class="w-full bg-secondary/95 backdrop-blur-md text-on-secondary font-bold text-xs md:text-sm tracking-wider uppercase py-2 md:py-2.5 rounded-lg md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 md:transform md:translate-y-2 md:group-hover:translate-y-0 hover:bg-secondary pointer-events-none md:pointer-events-auto z-10"
            aria-label="Add to cart"
          >
            {{ i18n.t().catalog.addToCart }}
          </button>
        </div>
      </div>
      <div class="flex flex-col gap-1">
        <span class="text-xs text-on-surface-variant uppercase tracking-wider font-medium">
          {{ i18n.translateCategory(product().category) }}
        </span>
        <h3 class="font-headline text-base md:text-xl text-primary group-hover:text-secondary transition-colors leading-tight line-clamp-2">
          {{ product().title }}
        </h3>
        <p class="text-sm md:text-base text-primary mt-1 font-medium">
          {{ product().price | currency:'USD':'symbol':'1.2-2' }}
        </p>
      </div>
    </article>
  `
})
export class ProductCardComponent {
  protected i18n = inject(I18nService);
  private favoritesService = inject(FavoritesService);

  product = input.required<Product>();
  addToCart = output<Product>();
  favorite = output<Product>();

  isFavorite = computed(() => this.favoritesService.isFavorite(this.product().id));

  onAddToCart(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.addToCart.emit(this.product());
  }

  onFavorite(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.favoritesService.toggle(this.product());
    this.favorite.emit(this.product());
  }
}
