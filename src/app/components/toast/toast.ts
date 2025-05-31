import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NgClass, NgFor } from '@angular/common';

import { Subscription } from 'rxjs';

import { ToastService, ToastData } from '../../services/toast';

@Component({
  selector: 'app-toast',
  imports: [NgFor, NgClass],
  templateUrl: './toast.html',
  styleUrls: ['./toast.scss'],
})
export class ToastComponent implements OnInit, OnDestroy {
  private toastService = inject(ToastService);
  private subscription = new Subscription();

  activeToasts: (ToastData & { id: number })[] = [];
  private counter = 0;

  ngOnInit(): void {
    this.subscription = this.toastService.toast$.subscribe(toast => {
      const id = this.counter++;
      const toastWithId = { ...toast, id };

      this.activeToasts.push(toastWithId);

      // Remove toast after duration
      setTimeout(() => {
        this.activeToasts = this.activeToasts.filter(t => t.id !== id);
      }, toast.duration || 3000);
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
