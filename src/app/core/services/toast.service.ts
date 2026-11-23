import { Injectable, signal, inject } from '@angular/core';
import { LanguageService } from './language.service';
export interface ClinicToast {
  id: number;
  type: 'success' | 'error';
  message: string;
  title: string;
}
@Injectable({ providedIn: 'root' })
export class ToastService {
  private language = inject(LanguageService);
  readonly items = signal<ClinicToast[]>([]);
  private sequence = 0;
  success(message: string, title = 'Success') {
    this.show('success', message, title);
  }
  error(message: string, title = 'Error') {
    this.show('error', message, title);
  }
  private show(type: 'success' | 'error', message: string, title: string) {
    const id = ++this.sequence;
    this.items.update((items) => [...items.slice(-2), { id, type, message, title }]);
    setTimeout(() => this.dismiss(id), type === 'error' ? 8000 : 4500);
  }
  dismiss(id: number) {
    this.items.update((items) => items.filter((item) => item.id !== id));
  }
}
