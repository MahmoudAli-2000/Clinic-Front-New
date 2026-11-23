import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
export interface Appearance {
  mode: 'light' | 'dark' | 'system';
  accent: string;
  density: 'comfortable' | 'compact';
  corners: 'rounded' | 'soft' | 'square';
  textSize: 'default' | 'large';
  font: 'system' | 'serif' | 'mono';
}
export const DEFAULT_APPEARANCE: Appearance = {
  mode: 'light',
  accent: '#278575',
  density: 'comfortable',
  corners: 'rounded',
  textSize: 'default',
  font: 'system',
};
@Injectable({ providedIn: 'root' })
export class AppearanceService {
  private http = inject(HttpClient);
  private doc = inject(DOCUMENT);
  private platform = inject(PLATFORM_ID);
  value: Appearance = { ...DEFAULT_APPEARANCE };
  private userId: string | null = null;
  private media?: MediaQueryList;
  constructor() {
    if (isPlatformBrowser(this.platform)) {
      this.media = window.matchMedia('(prefers-color-scheme: dark)');
      this.media.addEventListener('change', () => {
        if (this.value.mode === 'system') this.apply(this.value);
      });
    }
  }
  load(userId: string) {
    this.userId = userId;
    this.apply(DEFAULT_APPEARANCE);
    this.http.get<Appearance>('/api/Appearance').subscribe({
      next: (value) => {
        if (this.userId === userId) this.apply(value);
      },
      error: () => {},
    });
  }
  save(value: Appearance) {
    return this.http.put<Appearance>('/api/Appearance', value);
  }
  reset() {
    this.userId = null;
    this.apply(DEFAULT_APPEARANCE);
  }
  apply(value: Appearance) {
    if (!isPlatformBrowser(this.platform)) return;
    this.value = { ...DEFAULT_APPEARANCE, ...value };
    const root = this.doc.documentElement;
    root.dataset['theme'] =
      this.value.mode === 'system' ? (this.media?.matches ? 'dark' : 'light') : this.value.mode;
    root.dataset['density'] = this.value.density;
    root.dataset['corners'] = this.value.corners;
    root.dataset['textSize'] = this.value.textSize;
    root.dataset['font'] = this.value.font;
    const color = /^#[0-9a-f]{6}$/i.test(this.value.accent) ? this.value.accent : DEFAULT_APPEARANCE.accent;
    root.style.setProperty('--cp-green', color);
    root.style.setProperty('--cp-accent', color);
    const rgb = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
    const luminance = rgb.reduce((sum, c, i) => sum + c * [0.299, 0.587, 0.114][i], 0);
    root.style.setProperty('--cp-accent-ink', luminance > 155 ? '#102a26' : '#ffffff');
  }
}
