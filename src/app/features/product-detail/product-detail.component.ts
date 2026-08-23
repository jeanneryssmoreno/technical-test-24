import { Component, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe, NgClass } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/components/icon.component';
import { ProductCardComponent } from '../../shared/components/product-card.component';
import { I18nService } from '../../core/i18n/i18n.service';
import { Product } from '../../core/models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, NgClass, IconComponent, ProductCardComponent],
  template: `
    <main class="flex-grow pb-24 md:pb-8">
      <div class="max-w-[1280px] mx-auto px-4 md:px-16 pt-6 md:pt-12">
        
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-on-surface-variant mb-6 text-xs font-medium uppercase tracking-wider" aria-label="Breadcrumb">
          <a routerLink="/catalog" class="hover:text-primary transition-colors">
            {{ i18n.t().layout.catalog }}
          </a>
          <app-icon name="chevron_right" [size]="14" />
          <span class="text-primary">{{ i18n.translateCategory(product()?.category || '') }}</span>
        </nav>

        @if (product(); as product) {
          <section class="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
            
            <!-- Product Image -->
            <div class="md:col-span-6 lg:col-span-5">
              <div class="w-full aspect-square md:aspect-[4/5] bg-surface-container-low rounded-lg overflow-hidden flex items-center justify-center">
                <img 
                  [src]="product.image" 
                  [alt]="product.title"
                  loading="lazy"
                  class="w-full h-full object-contain p-8 md:p-12 transition-transform duration-700 ease-in-out hover:scale-105"
                />
              </div>
            </div>

            <!-- Product Details -->
            <div class="md:col-span-6 lg:col-span-7 flex flex-col pt-3 md:pt-0 md:sticky md:top-24 h-fit">
              
              <h1 class="font-headline text-4xl md:text-5xl text-primary mb-2 leading-tight">
                {{ product.title }}
              </h1>
              
              <p class="text-lg text-primary mb-6 font-medium">
                {{ product.price | currency:'USD':'symbol':'1.2-2' }}
              </p>
              
              <p class="text-base text-on-surface-variant mb-12 leading-relaxed">
                {{ product.description }}
              </p>
              
              <div class="h-[1px] w-full bg-outline-variant opacity-30 mb-6"></div>

              <!-- Quantity Selector -->
              <div class="mb-6">
                <h3 class="text-xs font-bold uppercase tracking-widest text-primary mb-3">
                  {{ i18n.t().cart.quantity }}
                </h3>
                <div class="flex items-center border border-outline-variant/50 rounded-lg p-1 gap-4 w-fit">
                  <button 
                    (click)="decreaseQuantity()"
                    class="text-on-surface-variant px-2 hover:text-primary transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <app-icon name="remove" [size]="16" />
                  </button>
                  <span class="text-base text-primary font-medium w-8 text-center">
                    {{ quantity() }}
                  </span>
                  <button 
                    (click)="increaseQuantity()"
                    class="text-on-surface-variant px-2 hover:text-primary transition-colors"
                    aria-label="Increase quantity"
                  >
                    <app-icon name="add" [size]="16" />
                  </button>
                </div>
              </div>

              <!-- Add to Cart Button -->
              <button 
                (click)="addToCart()"
                class="w-full bg-accent hover:bg-secondary text-white py-4 rounded-lg font-bold text-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <span>{{ i18n.t().catalog.addToCart }}</span>
                <app-icon name="shopping_bag" [size]="18" />
              </button>
              
              <div class="mt-3 flex items-center justify-center gap-1 text-on-surface-variant text-sm">
                <app-icon name="local_shipping" [size]="16" />
                <span>{{ i18n.t().cart.freeShipping }}</span>
              </div>

              <!-- Rating -->
              @if (product.rating) {
                <div class="mt-6 flex items-center gap-2">
                  <div class="flex">
                    @for (star of getStars(product.rating.rate); track $index) {
                      <app-icon 
                        name="star" 
                        [size]="20"
                        [fill]="star"
                        [ngClass]="star ? 'text-yellow-500' : 'text-outline-variant'"
                      />
                    }
                  </div>
                  <span class="text-sm text-on-surface-variant">
                    ({{ product.rating.count }} {{ i18n.t().catalog.reviews }})
                  </span>
                </div>
              }

            </div>
          </section>

          <!-- Related Products -->
          @if (relatedProducts().length > 0) {
            <section class="mt-20 pt-20 border-t border-outline-variant/30">
              <h2 class="font-headline text-3xl text-primary mb-12 text-center md:text-left">
                {{ i18n.t().catalog.youMayAlsoLike }}
              </h2>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                @for (relatedProduct of relatedProducts(); track relatedProduct.id) {
                  <app-product-card
                    [product]="relatedProduct"
                    (addToCart)="onRelatedAddToCart($event)"
                    (favorite)="onRelatedFavorite($event)"
                  />
                }
              </div>
            </section>
          }
        }

      </div>
    </main>
  `
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private toastService = inject(ToastService);
  private destroyRef = inject(DestroyRef);
  protected i18n = inject(I18nService);

  product = signal<Product | null>(null);
  relatedProducts = signal<Product[]>([]);
  quantity = signal(1);

  ngOnInit(): void {
    this.route.params
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(params => {
          const productId = +params['id'];
          return this.productService.getProductById(productId);
        })
      )
      .subscribe({
        next: (product) => {
          this.product.set(product);
          this.quantity.set(1);
          this.loadRelatedProducts(product.category);
        },
        error: () => {
          this.router.navigate(['/catalog']);
        }
      });
  }

  private loadRelatedProducts(category: string): void {
    this.productService.getProductsByCategory(category)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(products => {
        const currentProductId = this.product()?.id;
        const related = products
          .filter(p => p.id !== currentProductId)
          .slice(0, 4);
        this.relatedProducts.set(related);
      });
  }

  increaseQuantity(): void {
    this.quantity.update(q => q + 1);
  }

  decreaseQuantity(): void {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  addToCart(): void {
    const product = this.product();
    if (product) {
      this.cartService.addItemWithQuantity(product, this.quantity());
      this.toastService.success(`${product.title} ${this.i18n.t().catalog.addedToCart}`);
      this.quantity.set(1);
    }
  }

  onRelatedAddToCart(product: Product): void {
    this.cartService.addItem(product);
    this.toastService.success(`${product.title} ${this.i18n.t().catalog.addedToCart}`);
  }

  onRelatedFavorite(product: Product): void {
    this.toastService.success(`${product.title} ${this.i18n.t().catalog.addedToFavorites}`);
  }

  getStars(rate: number): boolean[] {
    return Array(5).fill(0).map((_, i) => i < Math.round(rate));
  }
}
