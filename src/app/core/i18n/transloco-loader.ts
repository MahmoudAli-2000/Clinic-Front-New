import { Injectable } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { of } from 'rxjs';
import en from '../../../assets/i18n/en.json';
import ar from '../../../assets/i18n/ar.json';
// Bundled JSON works in browser and SSR without an extra network dependency.
@Injectable({ providedIn: 'root' })
export class ClinicTranslationLoader implements TranslocoLoader {
  getTranslation(lang: string) {
    return of((lang === 'ar' ? ar : en) as Translation);
  }
}
