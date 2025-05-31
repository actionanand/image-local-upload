import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { ConfirmationRequest } from '../models/image.model';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationService {
  private confirmSubject = new Subject<ConfirmationRequest>();

  confirm$ = this.confirmSubject.asObservable();

  confirm(message: string): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.confirmSubject.next({
        message,
        resolve,
      });
    });
  }
}
