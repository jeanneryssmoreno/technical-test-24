import { Component, inject, signal, DestroyRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { ButtonComponent } from '../../shared/components/button.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-surface px-4">
      <div class="w-full max-w-md">
        <div class="bg-surface-container-lowest rounded-2xl ambient-shadow-lvl2 p-8 space-y-6">
          <div class="text-center">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary-container mb-4">
              <svg class="w-8 h-8 text-on-secondary-container" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <h1 class="font-headline text-3xl text-primary">{{ i18n.t().auth.title }}</h1>
            <p class="text-on-surface-variant mt-2">{{ i18n.t().auth.subtitle }}</p>
          </div>

          <div class="flex justify-center">
            <button
              (click)="i18n.toggleLanguage()"
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
              </svg>
              {{ i18n.lang() === 'es' ? 'English' : 'Español' }}
            </button>
          </div>

          @if (errorMessage()) {
            <div class="bg-error-container border border-error/20 rounded-lg p-4 flex items-start gap-3">
              <svg class="w-5 h-5 text-on-error-container flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p class="text-sm text-on-error-container">{{ errorMessage() }}</p>
            </div>
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label for="username" class="block text-sm font-medium text-on-surface mb-1">
                {{ i18n.t().auth.username }}
              </label>
              <input
                id="username"
                type="text"
                formControlName="username"
                class="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent transition-all bg-surface-container-lowest text-on-surface"
                [class.border-error]="loginForm.get('username')?.invalid && loginForm.get('username')?.touched"
                placeholder="Usuario"
                autocomplete="username"
              />
              @if (loginForm.get('username')?.invalid && loginForm.get('username')?.touched) {
                <p class="mt-1 text-sm text-error">
                  @if (loginForm.get('username')?.errors?.['required']) {
                    {{ i18n.t().auth.usernameRequired }}
                  }
                </p>
              }
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-on-surface mb-1">
                {{ i18n.t().auth.password }}
              </label>
              <div class="relative">
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  class="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent transition-all pr-12 bg-surface-container-lowest text-on-surface"
                  [class.border-error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                  placeholder="••••••••"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  (click)="showPassword.set(!showPassword())"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                  aria-label="Toggle password visibility"
                >
                  @if (showPassword()) {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                    </svg>
                  } @else {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  }
                </button>
              </div>
              @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
                <p class="mt-1 text-sm text-error">
                  @if (loginForm.get('password')?.errors?.['required']) {
                    {{ i18n.t().auth.passwordRequired }}
                  }
                  @if (loginForm.get('password')?.errors?.['minlength']) {
                    {{ i18n.t().auth.passwordMinLength }}
                  }
                </p>
              }
            </div>

            <app-button
              type="submit"
              [fullWidth]="true"
              size="lg"
              [disabled]="loginForm.invalid"
              [loading]="isLoading()"
            >
              {{ i18n.t().auth.loginButton }}
            </app-button>
          </form>

        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  protected i18n = inject(I18nService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  showPassword = signal(false);

  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { username, password } = this.loginForm.value;

    this.authService.login(username!, password!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/catalog';
          this.router.navigateByUrl(returnUrl);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.status === 401
            ? this.i18n.t().auth.invalidCredentials
            : this.i18n.t().auth.serverError
          );
        }
      });
  }
}
