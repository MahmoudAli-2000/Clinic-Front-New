import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from '../services/language.service';
@Pipe({ name: 'ui', standalone: true, pure: false })
export class UiPipe implements PipeTransform {
  private language = inject(LanguageService);
  transform(value: unknown): string {
    return this.language.t(value);
  }
}
