import { Component, OnInit } from '@angular/core';
import { RejetService, Rejet } from '../../../shared/services/rejet.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../auth/auth.service';
import { UserService } from '../../../shared/services/user.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-rejet-list',
  templateUrl: './rejet-list.component.html',
  styleUrls: ['./rejet-list.component.css']
})
export class RejetListComponent implements OnInit {
  rejets: Rejet[] = [];
  loading = true;
  error: string | null = null;
  searchTerm = '';

  userType: string = '';
  isRecouvrementUser: boolean = false;

  constructor(
    private readonly rejetService: RejetService,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
    private readonly http: HttpClient
  ) {}

  ngOnInit(): void {
    this.userType = this.authService.getUserType();
    this.isRecouvrementUser = this.userType === 'Recouvrement';
    console.log("something",this.userType === 'Recouvrement'," because ",this.userType);
    this.loadRejets();
  }

  loadRejets(): void {
    this.loading = true;
    this.error = null;

    // For Recouvrement users, always load all rejets
    // For other users, only load rejets they are notified about
    const observable = this.isRecouvrementUser 
      ? this.rejetService.getAllRejets() 
      : this.rejetService.getRejetsPourUtilisateurConnecte();

    observable
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => {
          this.rejets = data;
          console.log('Rejets loaded:', this.rejets.length, 'Is Recouvrement user:', this.isRecouvrementUser);
        },
        error: (err) => {
          console.error('Erreur lors du chargement des rejets', err);
          this.error = 'Impossible de charger les motifs de rejet. Veuillez réessayer plus tard.';
        }
      });
  }

  viewDossier(dossierId: number): void {
    this.router.navigate(['/dossiers', dossierId]);
  }

  marquerCommeTraite(rejet: Rejet, event: Event): void {
    event.stopPropagation();

    if (rejet.traite) return;

    const dossierId = rejet.dossier?.id;

    this.rejetService.marquerRejetCommeTraite(rejet.id, dossierId)
      .subscribe({
        next: (updatedRejet) => {
          const index = this.rejets.findIndex(r => r.id === rejet.id);
          if (index !== -1) {
            this.rejets[index] = updatedRejet;
          }
          
          // Send email notification to all users with type 'recouvrement'
          this.sendEmailToRecouvrementUsers(updatedRejet);
        },
        error: (err: Error) => {
          console.error('Erreur lors du traitement du rejet', err);
        }
      });
  }

  sendEmailToRecouvrementUsers(rejet: Rejet): void {
    console.log('Sending email notifications to Recouvrement users...');
    
    // Get all users with type 'Recouvrement' (note the capital R)
    this.userService.getUsersByType('Recouvrement').subscribe({
      next: (users: any[]) => {
        console.log(`Found ${users?.length || 0} Recouvrement users to notify`);
        
        if (users && users.length > 0) {
          const userName = this.authService.getLoggedInUserName();
          
          // Use the RejetService to send a notification to all users with ROLE_RECOUVREMENT
          // This will trigger the backend's notification system
          this.rejetService.notifyRejetTreated(rejet.id, userName)
            .subscribe({
              next: () => {
                console.log('Notification de traitement envoyée avec succès');
              },
              error: (err: any) => {
                console.error('Erreur lors de l\'envoi de la notification de traitement', err);
              }
            });
        } else {
          console.warn('Aucun utilisateur de type Recouvrement trouvé pour envoyer des notifications');
        }
      },
      error: (err: any) => {
        console.error('Erreur lors de la récupération des utilisateurs de type Recouvrement', err);
      }
    });
  }

  get filteredRejets(): Rejet[] {
    if (!this.searchTerm.trim()) {
      return this.rejets;
    }

    const searchTermLower = this.searchTerm.toLowerCase();
    return this.rejets.filter(rejet =>
      rejet.motif.toLowerCase().includes(searchTermLower) ||
      rejet.rejetePar.name.toLowerCase().includes(searchTermLower) ||
      rejet.dossier?.id.toString().includes(searchTermLower)
    );
  }

  get groupedRejets(): { [key: string]: Rejet[] } {
    return this.filteredRejets.reduce((acc, rejet) => {
      const dossierId = rejet.dossier?.id;
      if (!acc[dossierId]) {
        acc[dossierId] = [];
      }
      acc[dossierId].push(rejet);
      return acc;
    }, {} as { [key: string]: Rejet[] });
  }
}
