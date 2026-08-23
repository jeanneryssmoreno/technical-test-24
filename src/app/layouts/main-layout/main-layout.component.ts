import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { ProductService } from '../../core/services/product.service';
import { ToastContainerComponent } from '../../shared/components/toast.component';
import { IconComponent } from '../../shared/components/icon.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { I18nService } from '../../core/i18n/i18n.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastContainerComponent, IconComponent, BottomNavComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-surface">
      
      <!-- Header -->
      <header class="bg-surface w-full top-0 sticky z-50">
        <div class="flex justify-between items-center px-4 md:px-16 py-4 w-full">
          <button 
            (click)="mobileMenuOpen.set(!mobileMenuOpen())"
            class="text-primary hover:opacity-70 transition-opacity flex items-center justify-center p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-container md:hidden"
            aria-label="Toggle menu"
          >
            <app-icon [name]="mobileMenuOpen() ? 'close' : 'menu'" [size]="24" />
          </button>

          <div class="text-center flex-grow md:flex-grow-0">
            <a routerLink="/catalog" class="font-headline text-3xl tracking-widest text-primary uppercase font-bold">
              {{ i18n.t().layout.brand }}
            </a>
          </div>

          <div class="hidden md:flex flex-1 max-w-md mx-6">
            <div class="relative w-full">
              <input 
                type="text" 
                [placeholder]="i18n.t().layout.searchPlaceholder"
                [value]="searchQuery()"
                (input)="onSearchInput($event)"
                (keydown.enter)="onSearchSubmit()"
                class="w-full bg-surface-container-low border border-outline-variant/50 rounded-full py-2.5 pl-5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
              >
              <button 
                (click)="onSearchSubmit()"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors p-1"
                aria-label="Search"
              >
                <app-icon name="search" [size]="20" />
              </button>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              (click)="i18n.toggleLanguage()"
              class="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-container"
              [attr.aria-label]="i18n.lang() === 'es' ? 'Switch to English' : 'Cambiar a Español'"
            >
              <span class="text-xs font-bold uppercase">{{ i18n.lang() === 'es' ? 'EN' : 'ES' }}</span>
            </button>

            <a
              routerLink="/favorites"
              routerLinkActive="text-primary"
              class="text-primary hover:opacity-70 transition-opacity flex items-center justify-center p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-container relative"
              aria-label="Favorites"
            >
              <app-icon name="favorite" [size]="24" [fill]="true" />
              @if (favoritesService.count() > 0) {
                <span class="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce-in">
                  {{ favoritesService.count() }}
                </span>
              }
            </a>

            <a
              routerLink="/cart"
              routerLinkActive="text-primary"
              class="text-primary hover:opacity-70 transition-opacity flex items-center justify-center p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-container relative"
              aria-label="Shopping cart"
            >
              <app-icon name="shopping_bag" [size]="24" [fill]="true" />
              @if (cartService.itemCount() > 0) {
                <span class="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce-in">
                  {{ cartService.itemCount() }}
                </span>
              }
            </a>

            <button
              (click)="onLogout()"
              class="hidden md:flex text-on-surface-variant hover:text-error transition-colors p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-container items-center gap-1"
              aria-label="Logout"
            >
              <app-icon name="logout" [size]="20" />
              <span class="text-xs font-medium">{{ i18n.t().layout.logout }}</span>
            </button>
          </div>
        </div>

        <!-- Mobile Menu & Mobile Search -->
        @if (mobileMenuOpen()) {
          <div class="md:hidden border-t border-outline-variant/30 py-4 px-4 space-y-4 animate-slide-down bg-surface">
            
            <!-- Mobile Search -->
            <div class="relative w-full mb-2">
              <input 
                type="text" 
                [placeholder]="i18n.t().layout.searchPlaceholder"
                [value]="searchQuery()"
                (input)="onSearchInput($event)"
                (keydown.enter)="onSearchSubmit(); mobileMenuOpen.set(false)"
                class="w-full bg-surface-container-low border border-outline-variant/50 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
              >
              <button 
                (click)="onSearchSubmit(); mobileMenuOpen.set(false)"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                aria-label="Search"
              >
                <app-icon name="search" [size]="20" />
              </button>
            </div>

            <a
              routerLink="/catalog"
              routerLinkActive="text-primary font-bold"
              (click)="mobileMenuOpen.set(false)"
              class="block text-on-surface-variant hover:text-primary transition-colors py-2"
            >
              {{ i18n.t().layout.catalog }}
            </a>
            <div class="flex items-center justify-between py-2 border-t border-outline-variant/30 pt-4">
              <span class="text-sm text-on-surface-variant">{{ authService.user()?.username }}</span>
              <button
                (click)="onLogout()"
                class="text-sm text-error hover:text-error/80 transition-colors font-medium"
              >
                {{ i18n.t().layout.logout }}
              </button>
            </div>
          </div>
        }
      </header>

      <!-- Main Content -->
      <main class="flex-1">
        <router-outlet />
      </main>

      <!-- Footer -->
      <footer class="bg-surface-container-low w-full mt-auto">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center px-4 md:px-16 py-20 w-full">
          <div class="mb-12 md:mb-0">
            <span class="font-headline text-2xl text-primary opacity-80 hover:opacity-100 transition-opacity">
              {{ i18n.t().layout.brand }}
            </span>
          </div>
          <div class="flex flex-wrap gap-x-8 gap-y-4 mb-12 md:mb-0">
            <a class="text-sm text-on-surface-variant hover:text-secondary transition-colors opacity-80 hover:opacity-100" href="#">
              {{ i18n.t().layout.collection }}
            </a>
            <a class="text-sm text-on-surface-variant hover:text-secondary transition-colors opacity-80 hover:opacity-100" href="#">
              {{ i18n.t().layout.journal }}
            </a>
            <a class="text-sm text-on-surface-variant hover:text-secondary transition-colors opacity-80 hover:opacity-100" href="#">
              {{ i18n.t().layout.sustainability }}
            </a>
            <a class="text-sm text-on-surface-variant hover:text-secondary transition-colors opacity-80 hover:opacity-100" href="#">
              {{ i18n.t().layout.shipping }}
            </a>
            <a class="text-sm text-on-surface-variant hover:text-secondary transition-colors opacity-80 hover:opacity-100" href="#">
              {{ i18n.t().layout.returns }}
            </a>
          </div>
          <div>
            <p class="text-sm text-on-surface-variant opacity-80">
              {{ i18n.t().layout.footer }}
            </p>
          </div>
        </div>
      </footer>

      <!-- Bottom Navigation (Mobile) -->
      <app-bottom-nav />

      <!-- Toast Container -->
      <app-toast-container />
    </div>
  `
})
export class MainLayoutComponent {
  protected authService = inject(AuthService);
  protected cartService = inject(CartService);
  protected favoritesService = inject(FavoritesService);
  protected productService = inject(ProductService);
  protected i18n = inject(I18nService);
  private router = inject(Router);

  mobileMenuOpen = signal(false);
  searchQuery = signal('');

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  onSearchSubmit(): void {
    this.productService.setSearchQuery(this.searchQuery());
    this.router.navigate(['/catalog']);
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
