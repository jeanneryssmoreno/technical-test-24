import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
      }
    ]
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'catalog',
        loadChildren: () => import('./features/catalog/catalog.routes').then(m => m.CATALOG_ROUTES)
      },
      {
        path: 'product/:id',
        loadComponent: () => import('./features/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
      },
      {
        path: 'cart',
        loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent)
      },
      {
        path: 'checkout',
        loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent)
      },
      {
        path: 'favorites',
        loadComponent: () => import('./features/favorites/favorites.component').then(m => m.FavoritesComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
