import { ToastCenterComponent } from './shared/toast-center/toast-center.component';
import { BidiModule } from '@angular/cdk/bidi';
import { FormsModule } from '@angular/forms';
import { inject } from '@angular/core';
import { LanguageService } from './core/services/language.service';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ToastCenterComponent, RouterOutlet, BidiModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'CarePoint Clinic';
  language = inject(LanguageService);
}
