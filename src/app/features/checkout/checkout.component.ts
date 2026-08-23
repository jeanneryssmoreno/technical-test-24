import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { ButtonComponent } from '../../shared/components/button.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, ReactiveFormsModule, ButtonComponent, IconComponent],
  template: `
    <main class="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-16 py-12 mb-20 md:mb-0">

      <h2 class="font-headline text-4xl md:text-5xl text-primary mb-8 text-center">
        {{ i18n.t().checkout.title }}
      </h2>

      @if (paymentError()) {
        <div class="max-w-2xl mx-auto mb-8">
          <div class="bg-error-container border border-error/20 rounded-lg p-6 flex items-start gap-4">
            <svg class="w-6 h-6 text-on-error-container flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div class="flex-grow">
              <p class="text-on-error-container font-medium">{{ i18n.t().checkout.paymentError }}</p>
            </div>
          </div>
          <div class="text-center mt-6">
            <a routerLink="/cart"
               class="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-opacity hover:opacity-90">
              <app-icon name="arrow_back" [size]="18" />
              {{ i18n.t().checkout.backToCart }}
            </a>
          </div>
        </div>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

          <!-- Order Summary -->
          <div class="lg:col-span-5 order-2 lg:order-1">
            <div class="bg-surface-container-lowest p-6 rounded-xl ambient-shadow-lvl2 lg:sticky lg:top-24">
              <h3 class="font-headline text-2xl text-primary mb-6">
                {{ i18n.t().checkout.orderSummary }}
              </h3>
              <div class="flex flex-col gap-3 mb-6">
                @for (item of cartService.items(); track item.product.id) {
                  <div class="flex items-center gap-3">
                    <img class="w-12 h-16 object-contain p-1 rounded bg-surface-container-low"
                         [src]="item.product.image" [alt]="item.product.title" loading="lazy" />
                    <div class="flex-grow min-w-0">
                      <p class="text-sm font-medium text-primary truncate">{{ item.product.title }}</p>
                      <p class="text-xs text-on-surface-variant">x{{ item.quantity }}</p>
                    </div>
                    <span class="text-sm font-medium text-primary whitespace-nowrap">
                      {{ item.product.price * item.quantity | currency:'USD':'symbol':'1.2-2' }}
                    </span>
                  </div>
                }
              </div>
              <div class="border-t border-outline-variant/30 pt-4 flex flex-col gap-3 text-sm text-on-surface-variant">
                <div class="flex justify-between">
                  <span>{{ i18n.t().cart.subtotal }}</span>
                  <span class="text-primary font-medium">{{ cartService.total() | currency:'USD':'symbol':'1.2-2' }}</span>
                </div>
                <div class="flex justify-between">
                  <span>{{ i18n.t().cart.shipping }}</span>
                  <span class="text-primary font-medium">{{ i18n.t().cart.free }}</span>
                </div>
              </div>
              <div class="border-t border-outline-variant/30 pt-4 mt-4 flex justify-between items-end">
                <span class="font-bold text-sm uppercase tracking-wider text-primary">
                  {{ i18n.t().cart.total }}
                </span>
                <span class="font-headline text-2xl text-primary">
                  {{ cartService.total() | currency:'USD':'symbol':'1.2-2' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Payment Form -->
          <div class="lg:col-span-7 order-1 lg:order-2">
            <div class="bg-surface-container-lowest p-6 md:p-8 rounded-xl ambient-shadow-lvl2">
              <div class="flex items-center gap-2 mb-6">
                <app-icon name="lock" [size]="20" />
                <span class="text-sm text-on-surface-variant font-medium">{{ i18n.t().checkout.securePayment }}</span>
              </div>

              <form [formGroup]="paymentForm" (ngSubmit)="onSubmit()" class="space-y-5">
                <div>
                  <label for="cardNumber" class="block text-sm font-medium text-on-surface mb-1">
                    {{ i18n.t().checkout.cardNumber }}
                  </label>
                  <input
                    id="cardNumber"
                    type="text"
                    formControlName="cardNumber"
                    class="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent transition-all bg-surface-container-lowest text-on-surface"
                    [class.border-error]="paymentForm.get('cardNumber')?.invalid && paymentForm.get('cardNumber')?.touched"
                    [placeholder]="i18n.t().checkout.cardNumberPlaceholder"
                    maxlength="19"
                    inputmode="numeric"
                  />
                  @if (paymentForm.get('cardNumber')?.invalid && paymentForm.get('cardNumber')?.touched) {
                    <p class="mt-1 text-sm text-error">{{ i18n.t().checkout.invalidCardNumber }}</p>
                  }
                </div>

                <div>
                  <label for="cardHolder" class="block text-sm font-medium text-on-surface mb-1">
                    {{ i18n.t().checkout.cardHolder }}
                  </label>
                  <input
                    id="cardHolder"
                    type="text"
                    formControlName="cardHolder"
                    class="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent transition-all bg-surface-container-lowest text-on-surface"
                    [class.border-error]="paymentForm.get('cardHolder')?.invalid && paymentForm.get('cardHolder')?.touched"
                    [placeholder]="i18n.t().checkout.cardHolderPlaceholder"
                  />
                  @if (paymentForm.get('cardHolder')?.invalid && paymentForm.get('cardHolder')?.touched) {
                    <p class="mt-1 text-sm text-error">{{ i18n.t().checkout.invalidCardHolder }}</p>
                  }
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label for="expiry" class="block text-sm font-medium text-on-surface mb-1">
                      {{ i18n.t().checkout.expiry }}
                    </label>
                    <input
                      id="expiry"
                      type="text"
                      formControlName="expiry"
                      class="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent transition-all bg-surface-container-lowest text-on-surface"
                      [class.border-error]="paymentForm.get('expiry')?.invalid && paymentForm.get('expiry')?.touched"
                      [placeholder]="i18n.t().checkout.expiryPlaceholder"
                      maxlength="5"
                    />
                    @if (paymentForm.get('expiry')?.invalid && paymentForm.get('expiry')?.touched) {
                      <p class="mt-1 text-sm text-error">{{ i18n.t().checkout.invalidExpiry }}</p>
                    }
                  </div>
                  <div>
                    <label for="cvv" class="block text-sm font-medium text-on-surface mb-1">
                      {{ i18n.t().checkout.cvv }}
                    </label>
                    <input
                      id="cvv"
                      type="password"
                      formControlName="cvv"
                      class="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent transition-all bg-surface-container-lowest text-on-surface"
                      [class.border-error]="paymentForm.get('cvv')?.invalid && paymentForm.get('cvv')?.touched"
                      [placeholder]="i18n.t().checkout.cvvPlaceholder"
                      maxlength="4"
                      inputmode="numeric"
                    />
                    @if (paymentForm.get('cvv')?.invalid && paymentForm.get('cvv')?.touched) {
                      <p class="mt-1 text-sm text-error">{{ i18n.t().checkout.invalidCvv }}</p>
                    }
                  </div>
                </div>

                <app-button
                  type="submit"
                  [fullWidth]="true"
                  size="lg"
                  [disabled]="paymentForm.invalid"
                  [loading]="isProcessing()"
                >
                  {{ i18n.t().checkout.payNow }} - {{ cartService.total() | currency:'USD':'symbol':'1.2-2' }}
                </app-button>
              </form>

              <a routerLink="/cart"
                 class="block text-center text-sm text-on-surface-variant hover:text-primary mt-6 font-medium transition-colors">
                {{ i18n.t().checkout.backToCart }}
              </a>
            </div>
          </div>

        </div>
      }
    </main>
  `
})
export class CheckoutComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  protected cartService = inject(CartService);
  protected i18n = inject(I18nService);

  isProcessing = signal(false);
  paymentError = signal(false);

  paymentForm = this.fb.group({
    cardNumber: ['', [Validators.required, Validators.minLength(16), Validators.maxLength(19)]],
    cardHolder: ['', [Validators.required]],
    expiry: ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4)]]
  });

  onSubmit(): void {
    if (this.paymentForm.invalid) return;

    this.isProcessing.set(true);

    setTimeout(() => {
      this.isProcessing.set(false);
      this.paymentError.set(true);
    }, 2000);
  }
}
