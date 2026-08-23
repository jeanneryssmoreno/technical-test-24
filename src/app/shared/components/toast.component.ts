import { Component, inject } from '@angular/core';
import { ToastService, Toast } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm" role="status" aria-live="polite">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-slide-in"
          [class]="getToastClasses(toast.type)"
          role="alert"
        >
          @if (toast.type === 'success') {
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          } @else if (toast.type === 'error') {
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          } @else {
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          }
          <span class="flex-1">{{ toast.message }}</span>
          <button (click)="toastService.remove(toast.id)" class="opacity-70 hover:opacity-100" aria-label="Dismiss">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      }
    </div>
  `
})
export class ToastContainerComponent {
  protected toastService = inject(ToastService);

  getToastClasses(type: Toast['type']): string {
    switch (type) {
      case 'success': return 'bg-secondary text-on-secondary';
      case 'error': return 'bg-error text-on-error';
      default: return 'bg-inverse-surface text-inverse-on-surface';
    }
  }
}
