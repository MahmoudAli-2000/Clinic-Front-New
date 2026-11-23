import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HttpInterceptorFn, HttpErrorResponse, HttpClient, HttpBackend } from '@angular/common/http';
import { Observable, catchError, finalize, shareReplay, switchMap, throwError } from 'rxjs';
let refreshInFlight:Observable<unknown>|null=null;
export const authInterceptorInterceptor:HttpInterceptorFn=(req,next)=>{
 const router=inject(Router);const platform=inject(PLATFORM_ID);const backend=inject(HttpBackend);
 const api=req.url.startsWith('/api/');const request=api && isPlatformBrowser(platform)?req.clone({withCredentials:true}):req;
 return next(request).pipe(catchError((error:HttpErrorResponse)=>{
  if(!api || error.status!==401 || /\/auth\/(login|register|refresh|logout|forgot-password|reset-password)/i.test(req.url))return throwError(()=>error);
  if(!refreshInFlight)refreshInFlight=new HttpClient(backend).post('/api/Auth/refresh',null,{withCredentials:true}).pipe(finalize(()=>refreshInFlight=null),shareReplay({bufferSize:1,refCount:false}));
  return refreshInFlight.pipe(catchError(refreshError=>{if(!/\/auth\/me/i.test(req.url))router.navigate(['/admin/login']);return throwError(()=>refreshError);}),switchMap(()=>next(request)));
 }));
};
