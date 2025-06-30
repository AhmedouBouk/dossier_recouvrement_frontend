import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Garantie } from '../models/garantie.model';

@Injectable({
  providedIn: 'root'
})
export class GarantieUpdateService {
  // BehaviorSubject pour suivre les mises à jour des garanties
  private garantieUpdateSubject = new BehaviorSubject<Garantie | null>(null);
  
  // Observable public que les composants peuvent écouter
  public garantieUpdated$: Observable<Garantie | null> = this.garantieUpdateSubject.asObservable();

  constructor() { }

  /**
   * Notifie tous les composants abonnés qu'une garantie a été mise à jour
   * @param garantie La garantie mise à jour
   */
  notifyGarantieUpdated(garantie: Garantie): void {
    this.garantieUpdateSubject.next(garantie);
  }
}
