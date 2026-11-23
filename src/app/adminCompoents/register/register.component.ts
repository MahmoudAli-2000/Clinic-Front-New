import { UiPipe } from '../../core/pipes/ui.pipe';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NgClass, CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [UiPipe, ReactiveFormsModule, CommonModule, NgClass, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  msError = '';
  Isloading = false;
  IsSccuess = false;

  private readonly authService = inject(AuthService);
  private readonly Router = inject(Router);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toasterService = inject(ToastrService);

  registrationForm: FormGroup = this._formBuilder.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.registrationForm.valid) {
      this.Isloading = true;
      this.authService.Register(this.registrationForm.value).subscribe({
        next: () => {
          this.IsSccuess = true;
          this.toasterService.success('Your account is ready.', 'Welcome');
          setTimeout(() => {
            this.Router.navigate(['/patient/dashboard']);
          }, 1300);
          this.Isloading = false;
        },
        error: (err: HttpErrorResponse) => {
          this.msError = err.error?.message || 'Invalid full name, email or password';
          this.toasterService.error(this.msError, 'Invalid Registration');
          this.Isloading = false;
        },
      });
    } else {
      this.registrationForm.markAllAsTouched();
    }
  }
}
