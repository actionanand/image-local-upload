import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastData {
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastSubject = new Subject<ToastData>();

  toast$ = this.toastSubject.asObservable();

  showToast(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info', duration: number = 3000): void {
    this.toastSubject.next({ message, type, duration });
  }

  success(message: string, duration?: number): void {
    this.showToast(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.showToast(message, 'error', duration);
  }

  info(message: string, duration?: number): void {
    this.showToast(message, 'info', duration);
  }

  warning(message: string, duration?: number): void {
    this.showToast(message, 'warning', duration);
  }
}
