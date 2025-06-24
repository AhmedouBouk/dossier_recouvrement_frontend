import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ConfirmationData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  private confirmationSubject = new BehaviorSubject<ConfirmationData | null>(null);
  private resultSubject = new BehaviorSubject<boolean | null>(null);

  confirmation$ = this.confirmationSubject.asObservable();
  result$ = this.resultSubject.asObservable();

  confirm(data: ConfirmationData): Promise<boolean> {
    this.confirmationSubject.next(data);
    
    return new Promise((resolve) => {
      const subscription = this.result$.subscribe(result => {
        if (result !== null) {
          subscription.unsubscribe();
          this.resultSubject.next(null);
          resolve(result);
        }
      });
    });
  }

  confirmResult(result: boolean) {
    this.resultSubject.next(result);
    this.confirmationSubject.next(null);
  }

  close() {
    this.confirmationSubject.next(null);
    this.resultSubject.next(false);
  }
}