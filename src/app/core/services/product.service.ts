import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, switchMap, shareReplay, catchError, of, combineLatest, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private selectedCategory$ = new BehaviorSubject<string>('all');
  private searchQuery$ = new BehaviorSubject<string>('');

  private allProducts$ = this.http.get<Product[]>(`${environment.apiUrl}/products`).pipe(
    shareReplay(1),
    catchError(() => of([]))
  );

  readonly categories$: Observable<string[]> = this.http.get<string[]>(`${environment.apiUrl}/products/categories`).pipe(
    shareReplay(1),
    catchError(() => of([]))
  );

  readonly products$: Observable<Product[]> = combineLatest([
    this.selectedCategory$,
    this.searchQuery$
  ]).pipe(
    switchMap(([category, query]) => {
      const source$ = category === 'all' 
        ? this.allProducts$ 
        : this.http.get<Product[]>(`${environment.apiUrl}/products/category/${category}`).pipe(catchError(() => of([])));
        
      return source$.pipe(
        map(products => {
          if (!query) return products;
          const q = query.toLowerCase();
          return products.filter(p => 
            p.title.toLowerCase().includes(q) || 
            p.description.toLowerCase().includes(q)
          );
        })
      );
    })
  );

  setCategory(category: string): void {
    this.selectedCategory$.next(category);
  }

  getSelectedCategory(): string {
    return this.selectedCategory$.value;
  }

  setSearchQuery(query: string): void {
    this.searchQuery$.next(query);
  }

  getSearchQuery(): string {
    return this.searchQuery$.value;
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${environment.apiUrl}/products/${id}`).pipe(
      catchError(() => {
        throw new Error('Product not found');
      })
    );
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.apiUrl}/products/category/${category}`).pipe(
      catchError(() => of([]))
    );
  }
}
