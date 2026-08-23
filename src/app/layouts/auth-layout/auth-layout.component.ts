import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from '../../shared/components/toast.component';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent],
  template: `
    <main class="min-h-screen">
      <router-outlet />
    </main>
    <app-toast-container />
  `
})
export class AuthLayoutComponent {}
