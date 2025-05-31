import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { NgClass, NgFor } from '@angular/common';

import { Subscription } from 'rxjs';

import { ToastService, ToastData } from '../../services/toast';

@Component({
  selector: 'app-toast',
  imports: [NgFor, NgClass],
  templateUrl: './toast.html',
  styleUrls: ['./toast.scss'],
})
export class Toast implements OnInit {
  private toastService = inject(ToastService);
  private destroyRef = inject(DestroyRef);
  private toastSub = new Subscription();

  activeToasts: (ToastData & { id: number })[] = [];

  private counter = 0;

  ngOnInit(): void {
    this.toastSub = this.toastService.toast$.subscribe(toast => {
      // Create a new toast with unique ID
      const newToast = {
        id: Date.now(),
        message: toast.message || 'Notification', // Fallback message
        type: toast.type || 'info',
        duration: toast.duration || 3000,
      };

      // Add to active toasts
      this.activeToasts.push(newToast);

      // Remove after duration
      setTimeout(() => {
        this.activeToasts = this.activeToasts.filter(t => t.id !== newToast.id);
      }, newToast.duration);
    });

    this.destroyRef.onDestroy(() => {
      if (this.toastSub) {
        this.toastSub.unsubscribe();
      }
    });
  }
}
