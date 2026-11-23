import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';
import { UiPipe } from '../../core/pipes/ui.pipe';
@Component({
  selector: 'app-toast-center',
  standalone: true,
  imports: [CommonModule, UiPipe],
  templateUrl: './toast-center.component.html',
  styleUrl: './toast-center.component.css',
})
export class ToastCenterComponent {
  toast = inject(ToastService);
}
