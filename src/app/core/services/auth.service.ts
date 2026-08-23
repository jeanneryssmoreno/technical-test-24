import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginResponse, User } from '../models';

interface JwtPayload {
  sub: number;
  username: string;
  email: string;
  exp?: number;
  iat?: number;
  name?: { firstname: string; lastname: string };
  address?: User['address'];
  phone?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  private tokenSignal = signal<string | null>(this.getValidToken());
  private userSignal = signal<User | null>(this.getStoredUser());

  readonly token = this.tokenSignal.asReadonly();
  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.tokenSignal());

  constructor() {
    if (this.tokenSignal() === null && localStorage.getItem(this.TOKEN_KEY)) {
      this.clearSession();
    }
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, {
      username,
      password
    }).pipe(
      tap(response => {
        this.setSession(response.token);
      })
    );
  }

  logout(): void {
    this.clearSession();
  }

  private setSession(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.tokenSignal.set(token);
    this.decodeAndStoreUser(token);
  }

  private clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.tokenSignal.set(null);
    this.userSignal.set(null);
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getValidToken(): string | null {
    const token = this.getStoredToken();
    if (!token) return null;

    const payload = this.decodeJwtPayload(token);
    if (!payload || !payload.exp) return token;

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return null;
    }

    return token;
  }

  private getStoredUser(): User | null {
    const stored = localStorage.getItem(this.USER_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  private decodeAndStoreUser(token: string): void {
    try {
      const payload = this.decodeJwtPayload(token);
      if (payload) {
        const user: User = {
          id: payload.sub,
          username: payload.username,
          email: payload.email,
          name: {
            firstname: payload.name?.firstname || 'User',
            lastname: payload.name?.lastname || ''
          },
          address: payload.address || {
            city: '',
            street: '',
            number: 0,
            zipcode: '',
            geolocation: { lat: '', long: '' }
          },
          phone: payload.phone || ''
        };
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.userSignal.set(user);
      }
    } catch (error) {
      console.error('Error decoding JWT:', error);
    }
  }

  private decodeJwtPayload(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = parts[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }
}
