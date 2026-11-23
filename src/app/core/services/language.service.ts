import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TranslocoService } from '@jsverse/transloco';
import en from '../../../assets/i18n/en.json';
import ar from '../../../assets/i18n/ar.json';
export type ClinicLanguage = 'en' | 'ar';
const keys = new Map(Object.entries(en).map(([key, value]) => [value, key]));
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private platform = inject(PLATFORM_ID);
  private doc = inject(DOCUMENT);
  private http = inject(HttpClient);
  readonly translator = inject(TranslocoService);
  readonly lang = signal<ClinicLanguage>('en');
  private userId: string | null = null;
  private version = 0;
  private browser = isPlatformBrowser(this.platform);
  constructor() {
    this.translator.setTranslation(en, 'en');
    this.translator.setTranslation(ar, 'ar');
    if (this.browser) this.apply(this.read('carepoint:language:guest'));
  }
  get currentLang() {
    return this.lang;
  }
  get currentLangValue() {
    return this.lang();
  }
  private read(key: string): ClinicLanguage {
    try {
      return localStorage.getItem(key) === 'ar' ? 'ar' : 'en';
    } catch {
      return 'en';
    }
  }
  private apply(lang: ClinicLanguage) {
    this.lang.set(lang);
    this.translator.setActiveLang(lang);
    this.doc.documentElement.lang = lang;
    this.doc.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }
  setLanguage(value: string) {
    const lang: ClinicLanguage = value === 'ar' ? 'ar' : 'en';
    this.version++;
    this.apply(lang);
    if (this.browser) {
      try {
        localStorage.setItem('carepoint:language:' + (this.userId || 'guest'), lang);
      } catch {}
      if (this.userId)
        this.http.put('/api/Profile/language', { language: lang }).subscribe({ error: () => {} });
    }
  }
  load(userId: string) {
    this.userId = userId;
    const version = ++this.version;
    if (this.browser) this.apply(this.read('carepoint:language:' + userId));
    this.http.get<{ language: ClinicLanguage }>('/api/Profile/language').subscribe({
      next: (result) => {
        if (this.userId === userId && version === this.version && ['ar', 'en'].includes(result.language))
          this.apply(result.language);
      },
      error: () => {},
    });
  }
  reset() {
    this.userId = null;
    this.version++;
    this.apply(this.browser ? this.read('carepoint:language:guest') : 'en');
  }
  t(value: unknown): string {
    if (value === null || value === undefined) return '';
    const source = String(value);
    const key = keys.get(source);
    if (key) return this.translator.translate(key);
    // Compose only known UI labels. Never translate or alter user-authored clinical text.
    if (/^(New|Edit|Visit chart #|Consultation #) /.test(source)) {
      const match = source.match(/^(New|Edit|Visit chart #|Consultation #) (.*)$/);
      if (match) return this.t(match[1]) + ' ' + this.t(match[2]);
    }
    const numbered = source.match(/^(.*?)( #?[0-9]+)$/);
    if (numbered && keys.has(numbered[1])) return this.t(numbered[1]) + numbered[2];
    if (source.endsWith(' appointment')) return this.t(source.slice(0, -12)) + ' ' + this.t('appointment');
    const titled = [...keys.keys()].find((value) => value.toLowerCase() === source.toLowerCase());
    if (titled) return this.translator.translate(keys.get(titled)!);
    return source;
  }
}
