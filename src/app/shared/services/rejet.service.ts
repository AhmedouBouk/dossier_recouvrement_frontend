import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationService } from './notification.service';
import { DossierRecouvrementService } from './dossier-recouvrement.service';
import { UserService } from './user.service';

export interface RejetRequest {
  motif: string;
  typesUtilisateurs: string[];
  utilisateursIds: number[];
}

export interface Rejet {
  id: number;
  motif: string;
  dateRejet: Date;
  traite: boolean;
  dateTraitement?: Date;
  typesUtilisateurs: string[];
  dossier: {
    id: number;
    reference?: string;
  };
  rejetePar: {
    id: number;
    name: string;
    email: string;
  };
  utilisateursNotifies: {
    id: number;
    name: string;
    email: string;
    userType: string;
  }[];
  traitePar?: {
    id: number;
    name: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class RejetService {
  private readonly apiUrl = `${environment.apiUrl}/rejets`;

  constructor(
    private readonly http: HttpClient,
    private readonly notificationService: NotificationService,
    private readonly dossierService: DossierRecouvrementService,
    private readonly userService: UserService
  ) { }

  /**
   * Crée un rejet pour un dossier
   * @param dossierId L'ID du dossier
   * @param rejetRequest Les données du rejet
   */
  createRejet(dossierId: number, rejetRequest: RejetRequest): Observable<Rejet> {
    return this.http.post<Rejet>(`${this.apiUrl}/dossiers/${dossierId}`, rejetRequest);
  }

  /**
   * Récupère tous les rejets d'un dossier
   * @param dossierId L'ID du dossier
   */
  getRejetsForDossier(dossierId: number): Observable<Rejet[]> {
    return this.http.get<Rejet[]>(`${this.apiUrl}/dossiers/${dossierId}`);
  }

  /**
   * Marque un rejet comme traité
   * @param rejetId L'ID du rejet
   */
  marquerRejetCommeTraite(rejetId: number, dossierId?: number): Observable<Rejet> {
    return this.http.post<Rejet>(`${this.apiUrl}/${rejetId}/traiter`, {}).pipe(
      tap((rejet: Rejet) => {
        // Envoyer une notification aux utilisateurs de type recouvrement
        this.notificationService.notifierParRole(
          `Le rejet du dossier ${rejet.dossier.id} a été traité`,
          'ROLE_RECOUVREMENT',
          `/dossiers/view/${rejet.dossier.id}`
        ).subscribe();
        
        // Si l'ID du dossier est fourni, réinitialiser son état de validation
        if (dossierId ?? rejet.dossier.id) {
          const idDossier = dossierId ?? rejet.dossier.id;
          this.dossierService.resetValidationState(idDossier).subscribe({
            next: () => console.log(`État de validation du dossier ${idDossier} réinitialisé`),
            error: (err: Error) => console.error(`Erreur lors de la réinitialisation de l'état de validation du dossier ${idDossier}`, err)
          });
        }
      })
    );
  }

  /**
   * Récupère tous les rejets
   */
  getAllRejets(): Observable<Rejet[]> {
    return this.http.get<Rejet[]>(`${this.apiUrl}`);
  }

  /**
   * Récupère les rejets où l'utilisateur connecté est notifié
   */
  getRejetsPourUtilisateurConnecte(): Observable<Rejet[]> {
    return this.http.get<Rejet[]>(`${this.apiUrl}/mes-rejets`);
  }

  /**
   * Envoie une notification à tous les utilisateurs de type Recouvrement
   * concernant le traitement d'un rejet
   * @param rejetId L'ID du rejet traité
   * @param treatedByName Le nom de l'utilisateur qui a traité le rejet
   */
  notifyRejetTreated(rejetId: number, treatedByName: string): Observable<any> {
    // Récupérer d'abord les détails du rejet pour avoir l'ID du dossier
    return this.http.get<Rejet>(`${this.apiUrl}/${rejetId}`).pipe(
      switchMap(rejet => {
        const dossierId = rejet.dossier.id;
        const titre = `Traitement de rejet - Dossier #${dossierId}`;
        const message = `Le rejet du dossier ${dossierId} a été traité par ${treatedByName}`;
        const contenu = `Le rejet concernant le dossier #${dossierId} a été traité par ${treatedByName} le ${new Date().toLocaleString()}. Veuillez consulter le dossier pour plus de détails.`;
        const lienUrl = `/dossiers/${dossierId}`;
        
        // Utiliser la nouvelle méthode notifierParType qui cible spécifiquement les utilisateurs par type
        // et non par rôle, pour envoyer des notifications à tous les utilisateurs de type 'Recouvrement'
        return this.notificationService.notifierParType(
          message,
          'Recouvrement', // Type d'utilisateur (pas de rôle)
          lienUrl,
          titre,
          contenu
        ).pipe(
          tap(notifications => {
            console.log(`Notifications envoyées à ${notifications?.length ?? 0} utilisateurs de type Recouvrement`);
          })
        );
      })
    );
  }
}
