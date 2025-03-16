import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { RoleService } from '../../../shared/services/role.service';
import { DossierRecouvrementService } from '../../../shared/services/dossier-recouvrement.service';
import { DossierRecouvrement } from '../../../shared/models/dossier-recouvrement.model';
import { AuthService } from 'src/app/auth/auth.service';

import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dossier-recouvrement-list',
  templateUrl: './dossier-recouvrement-list.component.html',
  styleUrls: ['./dossier-recouvrement-list.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class DossierRecouvrementListComponent implements OnInit, OnDestroy {
  userType: string;

  dossiers: DossierRecouvrement[] = [];
  searchTerm: string = '';
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  isLoading = false;
  error: string | null = null;
  selectedFile: File | null = null; // Fichier sélectionné
selectedDossierId: number | null = null; // ID du dossier sélectionné
selectedPdfUrl: string | null = null;


  constructor(private http: HttpClient,
    private dossierService: DossierRecouvrementService,
    public roleService: RoleService,
    private router: Router,
    private authService: AuthService
  ) {
    this.searchSubject.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.performSearch(term);
    });
    this.userType = this.authService.getUserType(); // Récupérer le userType

  }

  ngOnInit(): void {
    this.loadDossiers();
  }
  


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  loadDossiers() {
    this.isLoading = true;
    this.error = null;
    this.dossierService.getDossiers().subscribe({
      next: (data) => {
        this.dossiers = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading dossiers:', err);
        this.error = typeof err === 'string' ? err : 'Une erreur est survenue lors du chargement des dossiers';
        this.isLoading = false;
      }
    });
  }

  onSearchChange(event: any) {
    const term = event.target.value;
    this.searchSubject.next(term);
  }

  private performSearch(term : string ) {
    if (!term.trim()) {
      this.loadDossiers();
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.dossierService.searchDossiers({ nomClient: term }).subscribe({
      next: (data) => {
        this.dossiers = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur de recherche', err);
        this.error = typeof err === 'string' ? err : 'Une erreur est survenue lors de la recherche';
        this.isLoading = false;
      }
    });
  }

  navigateToDetails(dossierId: number) {
    if (dossierId) {
      this.router.navigate(['dossiers/view/', dossierId]);
    }
  }

  navigateToEdit(dossierId: number) {
    if (dossierId) {
      this.router.navigate(['dossier-recouvrement/modify/', dossierId]);
    }
  }

  navigateToAdd() {
    this.router.navigate(['/dossiers/add']);
  }

  deleteDossier(dossierId: number) {
    if (dossierId && confirm('Confirmer la suppression ?')) {
      this.dossierService.deleteDossier(dossierId).subscribe({
        next: () => this.loadDossiers(),
        error: (err) => {
          console.error('Erreur de suppression', err);
          this.error = typeof err === 'string' ? err : 'Une erreur est survenue lors de la suppression';
        }
      });
    }
  }

  getValidationStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Initiale': 'pending',
      'Validé': 'active',
      'Non Validé': 'closed'
    };
    return statusMap[status] || 'pending';
  }

  onFileUpload(event: any): void {
    const file: File = event.target.files[0];
    if (!file) {
      this.error = 'Aucun fichier sélectionné.';
      return;
    }
  
    if (!file.name.endsWith('.csv')) {
      this.error = 'Le fichier doit être au format CSV.';
      return;
    }
  
    const formData = new FormData();
    formData.append('file', file);
  
    this.isLoading = true;
    this.error = null;
  
    this.dossierService.importDossiers(file).subscribe({
      next: (response: any) => {
        this.loadDossiers();
        this.isLoading = false;
        this.error = null;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur lors de l\'upload du fichier CSV :', err);
  
        // Gestion améliorée des erreurs
        if (err.error) {
          if (typeof err.error === 'string') {
            // Si l'erreur est une chaîne de caractères
            this.error = err.error;
          } else if (err.error.message) {
            // Si l'erreur est un objet avec une propriété 'message'
            this.error = err.error.message;
          } else {
            // Si l'erreur est un objet sans propriété 'message'
            this.error = 'Une erreur est survenue lors de l\'upload.';
          }
        } else {
          // Si l'erreur est une erreur réseau ou serveur
          this.error = 'Une erreur est survenue lors de l\'upload.';
        }
  
        this.isLoading = false;
      }
    });
  }
  getAlertIcon(type: 'success' | 'error'): string {
    const iconMap: Record<'success' | 'error', string> = {
      'success': 'check_circle',
      'error': 'error'
    };
    return iconMap[type];
  }

  telechargerMiseEnDemeure(dossier: DossierRecouvrement): void {
    this.dossierService.genererMiseEnDemeure(dossier);
  }
}