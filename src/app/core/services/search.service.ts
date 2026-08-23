import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, debounceTime, distinctUntilChanged, switchMap, of, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product } from '../models';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private http = inject(HttpClient);
  private searchQuery$ = new BehaviorSubject<string>('');

  readonly query$ = this.searchQuery$.asObservable();

  readonly results$: Observable<Product[]> = this.searchQuery$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(query => {
      if (!query.trim()) {
        return of([]);
      }
      return this.http.get<Product[]>(`${environment.apiUrl}/products`).pipe(
        catchError(() => of([]))
      );
    })
  );

  setQuery(query: string): void {
    this.searchQuery$.next(query);
  }

  clearQuery(): void {
    this.searchQuery$.next('');
  }

  filterProducts(products: Product[], query: string): Product[] {
    if (!query.trim()) {
      return products;
    }
    const searchTerm = query.toLowerCase().trim();
    return products.filter(product => 
      product.title.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
    );
  }
}
