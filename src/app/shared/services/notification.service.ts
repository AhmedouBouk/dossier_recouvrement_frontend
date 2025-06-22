import { Injectable, Injector } from '@angular/core';
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
  titre?: string;
  contenu?: string;
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

  constructor(
    private readonly http: HttpClient,
    private readonly injector: Injector
  ) { }

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
   * @param titre Titre optionnel de la notification
   * @param contenu Contenu détaillé optionnel de la notification
   */
  /**
   * @deprecated Utiliser notifierParType à la place pour cibler les utilisateurs par type et non par rôle
   */
  notifierParRole(message: string, role: string, lienUrl?: string, titre?: string, contenu?: string): Observable<Notification[]> {
    const notification: NotificationRequest = {
      message,
      type: 'SYSTEME',
      destinataireRole: role,
      lienUrl,
      titre,
      contenu
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
   * Envoie une notification à tous les utilisateurs d'un type spécifique
   * @param message Le message de la notification
   * @param userType Le type d'utilisateur (ex: 'Recouvrement')
   * @param lienUrl Lien optionnel vers une ressource
   * @param titre Titre optionnel de la notification
   * @param contenu Contenu détaillé optionnel de la notification
   */
  notifierParType(message: string, userType: string, lienUrl?: string, titre?: string, contenu?: string): Observable<Notification[]> {
    // Importer dynamiquement UserService pour éviter les dépendances circulaires
    return new Observable<Notification[]>(observer => {
      import('./user.service').then(module => {
        const UserService = module.UserService;
        // Utiliser l'injecteur Angular pour obtenir le UserService
        const userService = this.injector.get(UserService);
        
        // Obtenir tous les utilisateurs du type spécifié
        userService.getUsersByType(userType).subscribe({
          next: (users: any[]) => {
            if (!users || users.length === 0) {
              observer.next([]);
              observer.complete();
              return;
            }
            
            // Compteur pour suivre les notifications envoyées
            let completedCount = 0;
            const notifications: Notification[] = [];
            
            // Pour chaque utilisateur, envoyer une notification individuelle
            users.forEach(user => {
              const notificationRequest: NotificationRequest = {
                message,
                type: 'SYSTEME',
                titre,
                contenu,
                destinataireId: user.id,
                lienUrl
              };
              
              this.envoyerNotification(notificationRequest).subscribe({
                next: (notification) => {
                  notifications.push(notification);
                  completedCount++;
                  
                  // Si toutes les notifications ont été envoyées, compléter l'observable
                  if (completedCount === users.length) {
                    observer.next(notifications);
                    observer.complete();
                  }
                },
                error: (err: any) => {
                  console.error(`Erreur lors de l'envoi de la notification à ${user.email}`, err);
                  completedCount++;
                  
                  // Même en cas d'erreur, vérifier si toutes les notifications ont été traitées
                  if (completedCount === users.length) {
                    observer.next(notifications);
                    observer.complete();
                  }
                }
              });
            });
          },
          error: (err: any) => {
            console.error(`Erreur lors de la récupération des utilisateurs de type ${userType}`, err);
            observer.error(err);
          }
        });
      }).catch((err: any) => {
        console.error('Erreur lors du chargement du UserService', err);
        observer.error(err);
      });
    });
  }

  /**
   * Émet une notification pour les composants abonnés
   * @param notification La notification à émettre
   */
  emitNotification(notification: Notification): void {
    this.notificationsSubject.next(notification);
  }
}
