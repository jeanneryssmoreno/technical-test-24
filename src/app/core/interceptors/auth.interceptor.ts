import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { I18nService } from '../i18n/i18n.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);
  const i18n = inject(I18nService);

  const token = authService.token();
  const isLoginRequest = req.url.includes('/auth/login');

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isLoginRequest) {
        authService.logout();
        toastService.error(i18n.t().errors.unauthorized);
        router.navigate(['/login']);
      } else if (error.status === 0) {
        toastService.error(i18n.t().errors.networkError);
      } else if (error.status >= 500) {
        toastService.error(i18n.t().errors.serverError);
      } else if (error.status === 404) {
        toastService.error(i18n.t().errors.notFound);
      }

      return throwError(() => error);
    })
  );
};
