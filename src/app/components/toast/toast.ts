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
      const id = this.counter++;
      const toastWithId = { ...toast, id };

      this.activeToasts.push(toastWithId);

      // Remove toast after duration
      setTimeout(() => {
        this.activeToasts = this.activeToasts.filter(t => t.id !== id);
      }, toast.duration || 3000);
    });

    this.destroyRef.onDestroy(() => {
      if (this.toastSub) {
        this.toastSub.unsubscribe();
      }
    });
  }
}
