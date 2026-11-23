import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { WorkspaceApiService, apiError } from '../../core/services/workspace-api.service';
@Component({
  selector: 'app-account-recovery',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './account-recovery.component.html',
  styleUrl: './account-recovery.component.css',
})
export class AccountRecoveryComponent implements OnInit {
  api = inject(WorkspaceApiService);
  route = inject(ActivatedRoute);
  mode = 'forgot-password';
  email = '';
  token = '';
  userId = '';
  newPassword = '';
  busy = false;
  error = '';
  success = '';
  get title() {
    return this.mode === 'reset-password'
      ? 'Choose a new password'
      : this.mode === 'confirm-email'
        ? 'Confirm your email'
        : 'Forgot your password?';
  }
  ngOnInit() {
    this.mode = this.route.snapshot.data['mode'] || 'forgot-password';
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    this.userId = this.route.snapshot.queryParamMap.get('userId') || '';
  }
  async submit() {
    this.busy = true;
    this.error = '';
    try {
      if (this.mode === 'confirm-email') {
        await firstValueFrom(
          this.api.post(
            `Auth/confirm-email?userId=${encodeURIComponent(this.userId)}&token=${encodeURIComponent(this.token)}`,
            {}
          )
        );
        this.success = 'Email confirmed. You can now sign in.';
      } else if (this.mode === 'reset-password') {
        await firstValueFrom(
          this.api.post('Auth/reset-password', {
            email: this.email,
            token: this.token,
            newPassword: this.newPassword,
          })
        );
        this.success = 'Your password has been reset. You can now sign in.';
      } else {
        await firstValueFrom(this.api.post('Auth/forgot-password', { email: this.email }));
        this.success = 'If this email is registered, password reset instructions have been sent.';
      }
    } catch (e) {
      this.error = apiError(e);
    } finally {
      this.busy = false;
    }
  }
  async resend() {
    this.busy = true;
    this.error = '';
    try {
      await firstValueFrom(
        this.api.post(`Auth/resend-confirmation?email=${encodeURIComponent(this.email)}`, {})
      );
      this.success = 'If eligible, a confirmation email has been sent.';
    } catch (e) {
      this.error = apiError(e);
    } finally {
      this.busy = false;
    }
  }
}
