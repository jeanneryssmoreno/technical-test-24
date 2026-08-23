import { Component, input } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="getClasses()"
    >
      @if (loading()) {
        <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      }
      <ng-content></ng-content>
    </button>
  `
})
export class ButtonComponent {
  variant = input<'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input(false);
  loading = input(false);
  fullWidth = input(false);

  getClasses(): string {
    const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed';

    const variants: Record<string, string> = {
      primary: 'bg-primary hover:bg-primary-container text-on-primary focus:ring-primary-fixed-dim disabled:bg-outline disabled:text-on-surface-variant disabled:opacity-50',
      secondary: 'bg-secondary hover:bg-secondary/90 text-on-secondary focus:ring-secondary-fixed-dim disabled:bg-outline disabled:text-on-surface-variant disabled:opacity-50',
      outline: 'border-2 border-primary text-primary hover:bg-surface-container focus:ring-primary-fixed-dim disabled:border-outline disabled:text-on-surface-variant disabled:opacity-50',
      danger: 'bg-error hover:bg-error/90 text-on-error focus:ring-error-container disabled:bg-outline disabled:text-on-surface-variant disabled:opacity-50',
      ghost: 'text-on-surface-variant hover:bg-surface-container focus:ring-outline-variant disabled:text-outline-variant disabled:opacity-50'
    };

    const sizes: Record<string, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };

    const width = this.fullWidth() ? 'w-full' : '';

    return `${base} ${variants[this.variant()]} ${sizes[this.size()]} ${width}`;
  }
}
