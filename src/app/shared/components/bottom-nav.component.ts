import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from './icon.component';
import { FavoritesService } from '../../core/services/favorites.service';
import { I18nService } from '../../core/i18n/i18n.service';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IconComponent],
  template: `
    <nav class="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center bg-surface py-3 px-4 border-t border-outline-variant md:hidden pb-safe" aria-label="Mobile navigation">
      <a 
        routerLink="/catalog"
        routerLinkActive="text-primary font-bold"
        [routerLinkActiveOptions]="{ exact: false }"
        class="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary scale-95 active:scale-90 transition-transform"
      >
        <app-icon name="storefront" [size]="24" />
        <span class="text-xs font-medium mt-1">{{ i18n.t().layout.catalog }}</span>
      </a>
      <a 
        routerLink="/favorites"
        routerLinkActive="text-primary font-bold"
        class="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary scale-95 active:scale-90 transition-transform relative"
      >
        <app-icon name="favorite" [size]="24" />
        @if (favoritesService.count() > 0) {
          <span class="absolute -top-1 right-2 bg-accent text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {{ favoritesService.count() }}
          </span>
        }
        <span class="text-xs font-medium mt-1">{{ i18n.t().layout.saved }}</span>
      </a>
      <a 
        routerLink="/cart"
        routerLinkActive="text-primary font-bold"
        class="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary scale-95 active:scale-90 transition-transform"
      >
        <app-icon name="shopping_bag" [size]="24" />
        <span class="text-xs font-medium mt-1">{{ i18n.t().layout.cart }}</span>
      </a>
      <button 
        class="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary scale-95 active:scale-90 transition-transform"
        aria-label="Profile"
      >
        <app-icon name="person" [size]="24" />
        <span class="text-xs font-medium mt-1">{{ i18n.t().layout.profile }}</span>
      </button>
    </nav>
  `
})
export class BottomNavComponent {
  protected i18n = inject(I18nService);
  protected favoritesService = inject(FavoritesService);
}
