import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { Subscription } from 'rxjs';

import { ConfirmationService } from '../../services/confirmation';
import { ConfirmationRequest } from '../../models/image.model';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [NgIf],
  templateUrl: './confirmation.html',
  styleUrl: './confirmation.scss',
})
export class ConfirmationComponent implements OnInit, OnDestroy {
  private confirmationService = inject(ConfirmationService);
  private subscription = new Subscription();

  activeConfirmation: ConfirmationRequest | null = null;

  ngOnInit(): void {
    this.subscription = this.confirmationService.confirm$.subscribe(confirmation => {
      this.activeConfirmation = confirmation;
    });
  }

  confirm(): void {
    if (this.activeConfirmation) {
      const resolveReference = this.activeConfirmation.resolve;
      this.activeConfirmation = null;

      setTimeout(() => resolveReference(true), 0);
    }
  }

  cancel(): void {
    if (this.activeConfirmation) {
      this.activeConfirmation.resolve(false);
      this.activeConfirmation = null;
    }
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('confirmation-overlay')) {
      this.cancel();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
