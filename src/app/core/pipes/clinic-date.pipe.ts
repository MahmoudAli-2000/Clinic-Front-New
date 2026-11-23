import { Pipe, PipeTransform, inject } from '@angular/core';
import { DatePipe, registerLocaleData } from '@angular/common';
import arabic from '@angular/common/locales/ar';
import { LanguageService } from '../services/language.service';
registerLocaleData(arabic);
@Pipe({ name: 'clinicDate', standalone: true, pure: false })
export class ClinicDatePipe implements PipeTransform {
  private language = inject(LanguageService);
  transform(value: any, format = 'medium'): string | null {
    if (!value) return null;
    return new DatePipe(this.language.currentLang()).transform(value, format);
  }
}
