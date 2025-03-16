// src/app/pages/cheque-file-management/cheque-file-management.component.ts
import { Component, OnInit } from '@angular/core';
import { DossierRecouvrementService } from 'src/app/shared/services/dossier-recouvrement.service';
import { DossierRecouvrement } from 'src/app/shared/models/dossier-recouvrement.model';
import { HttpErrorResponse } from '@angular/common/http';
import { RoleService } from 'src/app/shared/services/role.service';

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

  constructor(private dossierService: DossierRecouvrementService,    public roleService: RoleService
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

  // Gérer la sélection d'un fichier
  onFileSelected(event: any, dossier: DossierRecouvrement): void {
    const file = event.target.files[0];
    if (file) {
      dossier.selectedFile = file; // Stocker le fichier sélectionné
    }
  }

  // Uploader un fichier de chèque
  uploadChequeFile(dossier: DossierRecouvrement): void {
    if (dossier.selectedFile) {
      this.isLoading = true;
      this.errorMessage = null;
      this.successMessage = null;
  
      this.dossierService.uploadChequeFile(dossier.id, dossier.selectedFile).subscribe({
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
  viewChequeFile(dossier: DossierRecouvrement): void {
    if (dossier.chequeFile) {
      const encodedUrl = encodeURI(dossier.chequeFile);
window.open(encodedUrl, '_blank');
    } else {
      console.error('Aucun fichier trouvé pour ce dossier.');
      alert('Aucun fichier trouvé pour ce dossier.');
    }
  }
  // Supprimer un fichier de chèque
  deleteChequeFile(dossier: DossierRecouvrement): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fichier de chèque ?')) {
      this.isLoading = true;
      this.errorMessage = null;
      this.successMessage = null;

      this.dossierService.deleteChequeFile(dossier.id).subscribe({
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