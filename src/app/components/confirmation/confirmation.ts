import { Component, DestroyRef, ElementRef, OnInit, inject } from '@angular/core';
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
export class ConfirmationComponent implements OnInit {
  private confirmationService = inject(ConfirmationService);
  private elementRef = inject(ElementRef);
  private destroyRef = inject(DestroyRef);

  private confirmSub = new Subscription();

  activeConfirmation: ConfirmationRequest | null = null;

  ngOnInit(): void {
    // When dialog opens, focus the first button
    this.confirmSub = this.confirmationService.confirm$.subscribe(confirmation => {
      this.activeConfirmation = confirmation;

      // Focus the first button after a short delay to allow rendering
      setTimeout(() => {
        this.focusFirstButton();
      }, 50);
    });

    this.destroyRef.onDestroy(() => {
      if (this.confirmSub) {
        this.confirmSub.unsubscribe();
      }
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

  onOverlayClick(event: Event): void {
    if ((event.target as HTMLElement).classList.contains('confirmation-overlay')) {
      this.cancel();
    }
  }

  private focusFirstButton(): void {
    const cancelButton = this.elementRef.nativeElement.querySelector('.cancel-btn');
    if (cancelButton) {
      cancelButton.focus();
    }
  }
}
