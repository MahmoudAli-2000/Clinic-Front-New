import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RecordData } from '../interfaces/workspace';
@Injectable({ providedIn: 'root' })
export class WorkspaceApiService {
  private http = inject(HttpClient);
  get<T = any>(path: string, query: RecordData = {}) {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') params = params.set(key, String(value));
    }
    return this.http.get<T>(`/api/${path}`, { params });
  }
  post<T = any>(path: string, body: any) { return this.http.post<T>(`/api/${path}`, body); }
  put<T = any>(path: string, body: any, query: RecordData = {}) {
    return this.http.put<T>(`/api/${path}`, body, {params: query});
  }
  delete(path: string) { return this.http.delete(`/api/${path}`); }
  save(path: string, value: RecordData, multipart = false, id?: number | string) {
    let body: any = value;
    if (multipart) {
      const form = new FormData();
      Object.entries(value).forEach(([key, val]) => {
        if (val === undefined || val === null || val === '') return;
        if (Array.isArray(val)) val.forEach(item => form.append(key, String(item)));
        else form.append(key, val instanceof Blob ? val : String(val));
      });
      body = form;
    }
    return id === undefined ? this.post(path, body) : this.put(`${path}/${id}`, body);
  }
}
export function apiError(error: any): string {
  if (error?.status === 0) return 'Cannot reach the clinic API. Check that the backend is running and the proxy is configured.';
  const errors = error?.error?.errors;
  if (Array.isArray(errors)) return errors.join(' ');
  if (errors && typeof errors === 'object') return Object.values(errors).flat().join(' ');
  return error?.error?.message || error?.error?.title || 'Something went wrong. Please try again.';
}
