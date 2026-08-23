import { Component, inject, OnInit, signal, DestroyRef, ElementRef } from '@angular/core';
import { AsyncPipe, NgClass } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { SkeletonComponent } from '../../shared/components/skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { ProductCardComponent } from '../../shared/components/product-card.component';
import { IconComponent } from '../../shared/components/icon.component';
import { I18nService } from '../../core/i18n/i18n.service';
import { Product } from '../../core/models';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    AsyncPipe,
    NgClass,
    SkeletonComponent,
    EmptyStateComponent,
    ProductCardComponent,
    IconComponent
  ],
  host: {
    '(document:click)': 'onDocumentClick($event)'
  },
  template: `
    <main class="flex-grow pb-24 md:pb-8 pt-8">
      <div class="max-w-[1280px] mx-auto px-4 md:px-16">
        
        <!-- Filters & Sort -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-3">
          <div class="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto hide-scrollbar">
            <button
              (click)="selectCategory('all')"
              [ngClass]="{
                'bg-primary text-on-primary': selectedCategory() === 'all',
                'bg-tertiary text-on-tertiary hover:bg-secondary hover:text-on-secondary': selectedCategory() !== 'all'
              }"
              class="font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-full whitespace-nowrap transition-colors"
            >
              {{ i18n.t().catalog.allCategories }}
            </button>
            @for (category of categories$ | async; track category) {
              <button
                (click)="selectCategory(category)"
                [ngClass]="{
                  'bg-primary text-on-primary': selectedCategory() === category,
                  'bg-tertiary text-on-tertiary hover:bg-secondary hover:text-on-secondary': selectedCategory() !== category
                }"
                class="font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-full whitespace-nowrap transition-colors"
              >
                {{ i18n.translateCategory(category) }}
              </button>
            }
          </div>
          
          <div class="relative flex items-center gap-2 self-end md:self-auto" #sortContainer>
            <span class="text-xs uppercase tracking-wider text-on-surface-variant font-medium">{{ i18n.t().common.sortBy }}:</span>
            <button
              (click)="toggleSortDropdown($event)"
              class="flex items-center gap-1 text-xs uppercase tracking-wider font-bold text-primary hover:text-secondary transition-colors group"
            >
              {{ getSortLabel() }}
              <app-icon name="expand_more" [size]="16" />
            </button>
            @if (showSortDropdown()) {
              <div class="absolute right-0 top-full mt-2 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-lg z-50 min-w-[200px] py-2">
                @for (option of sortOptions; track option) {
                  <button
                    (click)="selectSort(option)"
                    class="w-full text-left px-4 py-2.5 text-sm transition-colors"
                    [ngClass]="{
                      'bg-secondary-container text-on-secondary-container font-medium': selectedSort() === option,
                      'text-on-surface hover:bg-surface-container': selectedSort() !== option
                    }"
                  >
                    {{ getSortOptionLabel(option) }}
                  </button>
                }
              </div>
            }
          </div>
        </div>

        <!-- Loading State -->
        @if (isLoading()) {
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-8 md:gap-y-12">
            @for (i of skeletonItems; track i) {
              <div class="flex flex-col">
                <app-skeleton height="180px" />
                <app-skeleton height="1rem" width="60%" />
                <app-skeleton height="1.5rem" width="80%" />
                <app-skeleton height="1rem" width="40%" />
              </div>
            }
          </div>
        }
        
        <!-- Empty State -->
        @else if (products().length === 0) {
          <app-empty-state
            [title]="i18n.t().catalog.noProducts"
            [message]="productService.getSearchQuery() ? i18n.t().catalog.noSearchResults : i18n.t().catalog.noProductsMessage"
          />
        }
        
        <!-- Product Grid -->
        @else {
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-8 md:gap-y-12">
            @for (product of products(); track product.id) {
              <app-product-card
                [product]="product"
                (addToCart)="addToCart($event)"
                (favorite)="onFavorite($event)"
              />
            }
          </div>
        }

      </div>
    </main>
  `
})
export class CatalogComponent implements OnInit {
  protected productService = inject(ProductService);
  private cartService = inject(CartService);
  private toastService = inject(ToastService);
  private destroyRef = inject(DestroyRef);
  protected i18n = inject(I18nService);
  private elRef = inject(ElementRef);

  categories$!: Observable<string[]>;
  products = signal<Product[]>([]);
  allProducts = signal<Product[]>([]);
  selectedCategory = signal('all');
  selectedSort = signal<string>('featured');
  showSortDropdown = signal(false);
  isLoading = signal(true);
  readonly skeletonItems = [1, 2, 3, 4, 5, 6];

  sortOptions = ['priceLowHigh', 'priceHighLow', 'nameAZ', 'bestRated'];

  ngOnInit(): void {
    this.categories$ = this.productService.categories$;

    this.productService.products$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (products) => {
          this.allProducts.set(products);
          this.applySort(products);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      });
  }

  selectCategory(category: string): void {
    this.selectedCategory.set(category);
    this.isLoading.set(true);
    this.productService.setCategory(category);
  }

  toggleSortDropdown(event: Event): void {
    event.stopPropagation();
    this.showSortDropdown.update(v => !v);
  }

  selectSort(sortValue: string): void {
    this.selectedSort.set(sortValue);
    this.showSortDropdown.set(false);
    this.applySort(this.allProducts());
  }

  getSortLabel(): string {
    return this.getSortOptionLabel(this.selectedSort());
  }

  getSortOptionLabel(sortValue: string): string {
    const lang = this.i18n.lang();
    const labels: Record<string, Record<string, string>> = {
      es: {
        priceLowHigh: 'Precio: menor a mayor',
        priceHighLow: 'Precio: mayor a menor',
        nameAZ: 'Nombre A-Z',
        bestRated: 'Mejor valorados'
      },
      en: {
        priceLowHigh: 'Price: low to high',
        priceHighLow: 'Price: high to low',
        nameAZ: 'Name A-Z',
        bestRated: 'Best rated'
      }
    };
    return labels[lang][sortValue] || sortValue;
  }

  onDocumentClick(event: Event): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.showSortDropdown.set(false);
    }
  }

  private applySort(products: Product[]): void {
    const sorted = [...products];
    switch (this.selectedSort()) {
      case 'priceLowHigh':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'priceHighLow':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'nameAZ':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'bestRated':
        sorted.sort((a, b) => b.rating.rate - a.rating.rate);
        break;
    }
    this.products.set(sorted);
  }

  addToCart(product: Product): void {
    this.cartService.addItem(product);
    this.toastService.success(`${product.title} ${this.i18n.t().catalog.addedToCart}`);
  }

  onFavorite(product: Product): void {
    this.toastService.success(`${product.title} ${this.i18n.t().catalog.addedToFavorites}`);
  }
}
