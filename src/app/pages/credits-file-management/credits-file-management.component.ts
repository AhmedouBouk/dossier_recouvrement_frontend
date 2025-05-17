// src/app/pages/credits-file-management/credits-file-management.component.ts
import { Component, OnInit } from '@angular/core';
import { CreditsFileService } from 'src/app/shared/services/credits-file.service';
import { DossierRecouvrementService } from 'src/app/shared/services/dossier-recouvrement.service';
import { DossierRecouvrement } from 'src/app/shared/models/dossier-recouvrement.model';
import { HttpErrorResponse } from '@angular/common/http';
import { RoleService } from 'src/app/shared/services/role.service';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-credits-file-management',
  templateUrl: './credits-file-management.component.html',
  styleUrls: ['./credits-file-management.component.css'],
})
export class CreditsFileManagementComponent implements OnInit {
  dossiers: DossierRecouvrement[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private dossierService: DossierRecouvrementService,
    private creditsFileService: CreditsFileService,
    public roleService: RoleService,
        public authService:AuthService,
    
  ) {}

  ngOnInit(): void {
    this.loadDossiers();
  }

  // Charger la liste des dossiers
  loadDossiers(): void {
    this.isLoading = true;
    this.dossierService.getDossiers().subscribe({
      next: (data) => {
        this.dossiers = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des dossiers', err);
        this.errorMessage = 'Erreur lors du chargement des dossiers';
        this.isLoading = false;
      },
    });
  }
onFileSelectedAndUpload(event: any, dossier: any): void {
  const file: File = event.target.files[0];
  if (!file) return;

  dossier.selectedCreditsFile = file;
  this.uploadCreditsFile(dossier);
}


  // Uploader un fichier de crédit
  uploadCreditsFile(dossier: DossierRecouvrement): void {
    if (dossier.selectedCreditsFile) {
      this.isLoading = true;
      this.errorMessage = null;
      this.successMessage = null;

      this.creditsFileService.uploadCreditsFile(dossier.id, dossier.selectedCreditsFile).subscribe({
        next: (response) => {
          console.log('Fichier de crédit uploadé avec succès', response);
          this.successMessage = 'Fichier de crédit uploadé avec succès';
          this.loadDossiers(); // Recharger la liste des dossiers
        },
        error: (err) => {
          console.error('Erreur lors de l\'upload du fichier de crédit', err);
          this.errorMessage = 'Erreur lors de l\'upload du fichier de crédit';
        },
        complete: () => {
          this.isLoading = false;
        },
      });
    }
  }

  // Visualiser un fichier de crédit
  viewCreditsFile(dossier: DossierRecouvrement, download: boolean = false): void {
    if (!dossier.creditsFile) {
      alert('Aucun fichier trouvé pour ce dossier.');
      return;
    }
  
    const fileUrl = this.creditsFileService.getFullFileUrl(dossier.creditsFile);
    const token = this.authService.getToken(); // Récupérer le token JWT
  
    fetch(fileUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}` // Ajouter le token JWT dans l'en-tête
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du fichier');
      }
      return response.blob(); // Convertir la réponse en Blob
    })
    .then(blob => {
      const blobUrl = URL.createObjectURL(blob); // Créer un lien temporaire
  
      if (download) {
        // Télécharger le fichier
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = dossier.creditsFile.split('/').pop() || 'file.pdf'; // Nom du fichier
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // Ouvrir dans un nouvel onglet
        window.open(blobUrl, '_blank');
      }
    })
    .catch(error => {
      console.error('Erreur:', error);
      alert('Impossible de charger le fichier.');
    });
  }

  // Supprimer un fichier de crédit
  deleteCreditsFile(dossier: DossierRecouvrement): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fichier de crédit ?')) {
      this.isLoading = true;
      this.errorMessage = null;
      this.successMessage = null;

      this.creditsFileService.deleteCreditsFile(dossier.id).subscribe({
        next: () => {
          this.successMessage = 'Fichier de crédit supprimé avec succès';
          this.loadDossiers(); // Recharger la liste des dossiers
        },
        error: (err: HttpErrorResponse) => {
          console.error('Erreur lors de la suppression du fichier de crédit', err);
          this.errorMessage = 'Erreur lors de la suppression du fichier de crédit';
        },
        complete: () => {
          this.isLoading = false;
        },
      });
    }
  }

  // Gérer la recherche
  onSearchChange(event: any): void {
    this.searchTerm = event.target.value;
    // Implémentez la logique de recherche si nécessaire
  }
}