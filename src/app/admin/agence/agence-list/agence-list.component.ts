import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { AgenceService, Agence } from '../../../shared/services/agence.service';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-agence-list',
  templateUrl: './agence-list.component.html',
  styleUrls: ['./agence-list.component.css']
})
export class AgenceListComponent implements OnInit, OnDestroy {
  agences: Agence[] = [];
  isLoading: boolean = false;
  isNotificationVisible: boolean = false;
  notificationMessage: string = '';
  notificationType: 'success-snackbar' | 'error-snackbar' = 'success-snackbar';
  userName: string = '';
  userRole: string = '';
  showForm: boolean = false;
  selectedAgence: Agence | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private readonly agenceService: AgenceService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeComponent(): void {
    this.userName = this.authService.getLoggedInUserName();
    this.userRole = this.authService.getRole() || 'No Role';
    this.fetchAgences();
  }

  fetchAgences(): void {
    this.isLoading = true;
    this.agenceService.getAllAgences()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response) => {
          console.log('Raw API response:', response);
          
          // Assurez-vous que response est un tableau
          if (Array.isArray(response)) {
            this.agences = response;
          } else if (response && typeof response === 'object') {
            const responseObj = response as Record<string, any>;
            
            // Vérifier si c'est une réponse paginée de Spring Data REST
            if (responseObj['_embedded'] && responseObj['_embedded']['agences']) {
              // Format Spring Data REST standard
              this.agences = responseObj['_embedded']['agences'] as Agence[];
            } else if (responseObj['_embedded'] && responseObj['_embedded']['agenceList']) {
              // Autre nom possible pour la liste des agences
              this.agences = responseObj['_embedded']['agenceList'] as Agence[];
            } else if (responseObj['_embedded']) {
              // Si _embedded existe mais pas avec le nom attendu, chercher la première propriété tableau
              const embedded = responseObj['_embedded'] as Record<string, any>;
              const firstArrayProperty = Object.keys(embedded).find(key => Array.isArray(embedded[key]));
              
              if (firstArrayProperty) {
                this.agences = embedded[firstArrayProperty] as Agence[];
              } else {
                console.warn('No array found in _embedded, converting response to array:', response);
                this.agences = [response as Agence];
              }
            } else if (responseObj['data'] && Array.isArray(responseObj['data'])) {
              // Format API générique avec propriété data
              this.agences = responseObj['data'] as Agence[];
            } else {
              // Si c'est un objet simple, convertissez-le en tableau
              console.warn('Response is not in expected format, converting to array:', response);
              this.agences = [response as Agence];
            }
          } else {
            // Si ce n'est ni un tableau ni un objet, initialisez un tableau vide
            console.error('Unexpected response format:', response);
            this.agences = [];
          }
          
          console.log('Processed agences:', this.agences);
        },
        error: (error) => {
          console.error('Error fetching agences:', error);
          this.showNotification('Erreur lors du chargement des agences', 'error-snackbar');
        }
      });
  }

  openForm(agence?: Agence): void {
    this.selectedAgence = agence || null;
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.selectedAgence = null;
  }

  onSaveAgence(agence: Omit<Agence, 'id'>): void {
    if (this.selectedAgence) {
      // Update existing agence
      this.agenceService.updateAgence(this.selectedAgence.id, agence)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showNotification('Agence mise à jour avec succès', 'success-snackbar');
            this.fetchAgences();
            this.closeForm();
          },
          error: (error) => {
            console.error('Error updating agence:', error);
            this.showNotification('Erreur lors de la mise à jour de l\'agence', 'error-snackbar');
          }
        });
    } else {
      // Create new agence
      this.agenceService.createAgence(agence)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showNotification('Agence créée avec succès', 'success-snackbar');
            this.fetchAgences();
            this.closeForm();
          },
          error: (error) => {
            console.error('Error creating agence:', error);
            this.showNotification('Erreur lors de la création de l\'agence', 'error-snackbar');
          }
        });
    }
  }

  onDeleteAgence(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette agence ?')) {
      this.agenceService.deleteAgence(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showNotification('Agence supprimée avec succès', 'success-snackbar');
            this.fetchAgences();
          },
          error: (error) => {
            console.error('Error deleting agence:', error);
            this.showNotification('Erreur lors de la suppression de l\'agence', 'error-snackbar');
          }
        });
    }
  }

  navigateToUsers(): void {
    this.router.navigate(['/admin/user-list']);
  }

  navigateToRoles(): void {
    this.router.navigate(['/admin/roles']);
  }

  private showNotification(message: string, type: 'success-snackbar' | 'error-snackbar'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    this.isNotificationVisible = true;

    setTimeout(() => {
      this.isNotificationVisible = false;
    }, 3000);
  }

  trackByAgenceId(index: number, agence: Agence): number {
    return agence.id;
  }
}
