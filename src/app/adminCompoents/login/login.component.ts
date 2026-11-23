import { UiPipe } from '../../core/pipes/ui.pipe';
import { CommonModule, NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './../../core/services/auth.service';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [UiPipe, ReactiveFormsModule, CommonModule, NgClass, RouterLink],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  submitted = false;
  busy = false;
  IsSccuess = false;
  showPassword = false;
  serverError = '';
  returnUrl = '/admin/dashboard';

  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  private readonly toasterService = inject(ToastrService);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    const returnUrl = this._route.snapshot.queryParams['returnUrl'];
    this.returnUrl =
      typeof returnUrl === 'string' && /^\/(admin|patient|doctor|staff)\//.test(returnUrl)
        ? returnUrl
        : '/admin/dashboard';
  }

  onSubmit(): void {
    this.submitted = true;
    this.serverError = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    if (this.busy) return;
    this.busy = true;
    const loginData = this.loginForm.value;

    this.authService.Login(loginData).subscribe({
      next: () => {
        this.busy = false;
        this.IsSccuess = true;
        this.toasterService.success('Login successful!', 'Success');
        this._router.navigateByUrl(this.returnUrl);
      },
      error: (err: HttpErrorResponse) => {
        this.busy = false;
        this.serverError = err.error?.message || 'Invalid email or password';
        this.toasterService.error(this.serverError, 'Login Failed');
      },
    });
  }
}
