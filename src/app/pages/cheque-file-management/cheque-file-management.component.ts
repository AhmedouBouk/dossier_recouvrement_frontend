// src/app/pages/cheque-file-management/cheque-file-management.component.ts
import { Component, OnInit } from '@angular/core';
import { DossierRecouvrementService } from 'src/app/shared/services/dossier-recouvrement.service';
import { DossierRecouvrement } from 'src/app/shared/models/dossier-recouvrement.model';
import { HttpErrorResponse } from '@angular/common/http';
import { RoleService } from 'src/app/shared/services/role.service';
import { ChequeFileService } from 'src/app/shared/services/cheque-file.service'; // Importez le ChequeFileService
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-cheque-file-management',
  templateUrl: './cheque-file-management.component.html',
  styleUrls: ['./cheque-file-management.component.css']
})
export class ChequeFileManagementComponent implements OnInit {
  dossiers: DossierRecouvrement[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  pdfSrc: string | null = null;


  constructor(
    private dossierService: DossierRecouvrementService,
    private chequeFileService: ChequeFileService, // Injectez le ChequeFileService
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
      }
    });
  }
  getFileNameFromUrl(url: string | null): string {
    if (!url) {
      return 'Aucun fichier';
    }
    // Extraire le nom du fichier à partir de l'URL
    const fileName = url.split('/').pop() || 'Aucun fichier';
    return fileName;
  }
onFileSelectedAndUpload(event: any, dossier: any): void {
  const file: File = event.target.files[0];
  if (!file) return;

  dossier.selectedFile = file;
  this.uploadChequeFile(dossier); // upload automatique
}

  // Uploader un fichier de chèque en utilisant ChequeFileService
  uploadChequeFile(dossier: DossierRecouvrement): void {
    if (dossier.selectedFile) {
      this.isLoading = true;
      this.errorMessage = null;
      this.successMessage = null;

      // Utilisez le ChequeFileService pour l'upload
      this.chequeFileService.uploadChequeFile(dossier.id, dossier.selectedFile).subscribe({
        next: (response) => {
          console.log('Fichier de chèque uploadé avec succès', response);
          this.successMessage = 'Fichier de chèque uploadé avec succès';
          this.loadDossiers(); // Recharger la liste des dossiers
        },
        error: (err) => {
          console.error('Erreur lors de l\'upload du fichier de chèque', err);
          this.errorMessage = 'Erreur lors de l\'upload du fichier de chèque';
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  // Visualiser un fichier de chèque
  viewChequeFile(dossier: DossierRecouvrement, download: boolean = false): void {
    if (!dossier.chequeFile) {
      alert('Aucun fichier trouvé pour ce dossier.');
      return;
    }
  
    const fileUrl = this.chequeFileService.getFullFileUrl(dossier.chequeFile);
    const token = this.authService.getToken(); // Récupérer le token JWT
  
    fetch(fileUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
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
        a.download = dossier.chequeFile; // Nom du fichier
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
  
  
  // Supprimer un fichier de chèque
  deleteChequeFile(dossier: DossierRecouvrement): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fichier de chèque ?')) {
      this.isLoading = true;
      this.errorMessage = null;
      this.successMessage = null;

      // Utilisez le ChequeFileService pour la suppression
      this.chequeFileService.deleteChequeFile(dossier.id).subscribe({
        next: () => {
          this.successMessage = 'Fichier supprimé avec succès';
          this.loadDossiers(); // Recharger la liste des dossiers
        },
        error: (err: HttpErrorResponse) => {
          console.error('Erreur lors de la suppression du fichier', err);
          this.errorMessage = 'Erreur lors de la suppression du fichier';
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  // Gérer la recherche
  onSearchChange(event: any): void {
    this.searchTerm = event.target.value;
    // Implémentez la logique de recherche si nécessaire
  }
}