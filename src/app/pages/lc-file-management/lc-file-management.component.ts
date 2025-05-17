// src/app/pages/lc-file-management/lc-file-management.component.ts
import { Component, OnInit } from '@angular/core';
import { DossierRecouvrementService } from 'src/app/shared/services/dossier-recouvrement.service';
import { DossierRecouvrement } from 'src/app/shared/models/dossier-recouvrement.model';
import { HttpErrorResponse } from '@angular/common/http';
import { LcFileService } from 'src/app/shared/services/lc-file.service';
import { RoleService } from 'src/app/shared/services/role.service';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-lc-file-management',
  templateUrl: './lc-file-management.component.html',
  styleUrls: ['./lc-file-management.component.css'],
})
export class LcFileManagementComponent implements OnInit {
  dossiers: DossierRecouvrement[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private dossierService: DossierRecouvrementService,
    private lcFileService: LcFileService,
    public roleService: RoleService,
    public authService: AuthService,
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

  
onLcFileSelectedAndUpload(event: any, dossier: any): void {
  const file: File = event.target.files[0];
  if (!file) return;

  dossier.selectedLcFile = file; // stocker temporairement
  this.uploadLcFile(dossier);   // lancer immédiatement l'upload
}

  // Uploader un fichier LC
  uploadLcFile(dossier: DossierRecouvrement): void {
    if (dossier.selectedLcFile) {
      this.isLoading = true;
      this.errorMessage = null;
      this.successMessage = null;

      this.lcFileService.uploadLcFile(dossier.id, dossier.selectedLcFile).subscribe({
        next: (response) => {
          console.log('Fichier LC uploadé avec succès', response);
          this.successMessage = 'Fichier LC uploadé avec succès';
          this.loadDossiers(); // Recharger la liste des dossiers
        },
        error: (err) => {
          console.error('Erreur lors de l\'upload du fichier LC', err);
          this.errorMessage = 'Erreur lors de l\'upload du fichier LC';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
    }
  }

  // Visualiser un fichier LC avec option de téléchargement
  viewLcFile(dossier: DossierRecouvrement, download: boolean = false): void {
    if (!dossier.lcFile) {
      alert('Aucun fichier trouvé pour ce dossier.');
      return;
    }

    const fileUrl = this.lcFileService.getFullFileUrl(dossier.lcFile);
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
        a.download = dossier.lcFile.split('/').pop() || 'file.pdf'; // Nom du fichier
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

  // Supprimer un fichier LC
  deleteLcFile(dossier: DossierRecouvrement): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fichier LC ?')) {
      this.isLoading = true;
      this.errorMessage = null;
      this.successMessage = null;

      this.lcFileService.deleteLcFile(dossier.id).subscribe({
        next: () => {
          this.successMessage = 'Fichier LC supprimé avec succès';
          this.loadDossiers(); // Recharger la liste des dossiers
        },
        error: (err: HttpErrorResponse) => {
          console.error('Erreur lors de la suppression du fichier LC', err);
          this.errorMessage = 'Erreur lors de la suppression du fichier LC';
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