import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { LanguageService } from '../services/language.service';
export const langInterceptor: HttpInterceptorFn = (req, next) => {
  const language = inject(LanguageService).currentLang();
  return next(req.url.startsWith('/api/') ? req.clone({ setHeaders: { 'Accept-Language': language } }) : req);
};
