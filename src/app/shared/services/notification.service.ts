import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Notification {
  id: number;
  message: string;
  dateCreation: Date;
  lu: boolean;
  type: string;
  destinataireId?: number;
  destinataireRole?: string;
  lienUrl?: string;
}

export interface NotificationRequest {
  message: string;
  type: string;
  destinataireId?: number;
  destinataireRole?: string;
  lienUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  private notificationsSubject = new Subject<Notification>();
  
  // Observable que les composants peuvent écouter pour recevoir des notifications en temps réel
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(private http: HttpClient) { }

  /**
   * Envoie une notification
   * @param notification La notification à envoyer
   */
  envoyerNotification(notification: NotificationRequest): Observable<Notification> {
    return this.http.post<Notification>(`${this.apiUrl}`, notification);
  }

  /**
   * Envoie une notification à tous les utilisateurs d'un rôle spécifique
   * @param message Le message de la notification
   * @param role Le rôle des destinataires
   * @param lienUrl Lien optionnel vers une ressource
   */
  notifierParRole(message: string, role: string, lienUrl?: string): Observable<Notification[]> {
    const notification: NotificationRequest = {
      message,
      type: 'SYSTEME',
      destinataireRole: role,
      lienUrl
    };
    return this.http.post<Notification[]>(`${this.apiUrl}/role/${role}`, notification);
  }

  /**
   * Récupère les notifications non lues de l'utilisateur connecté
   */
  getNotificationsNonLues(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/non-lues`);
  }

  /**
   * Marque une notification comme lue
   * @param notificationId L'ID de la notification
   */
  marquerCommeLue(notificationId: number): Observable<Notification> {
    return this.http.post<Notification>(`${this.apiUrl}/${notificationId}/lire`, {});
  }

  /**
   * Émet une notification pour les composants abonnés
   * @param notification La notification à émettre
   */
  emitNotification(notification: Notification): void {
    this.notificationsSubject.next(notification);
  }
}
