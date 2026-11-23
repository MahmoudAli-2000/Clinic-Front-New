import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({ providedIn: 'root' })
export class NotificationCenterService {
  private http = inject(HttpClient);
  readonly unread = signal(0);
  refresh() {
    this.http
      .get<number>('/api/Notifications/unread-count')
      .subscribe({ next: (count) => this.unread.set(Number(count) || 0), error: () => {} });
  }
  reset() {
    this.unread.set(0);
  }
}
