// src/app/pages/cautions-file-management/cautions-file-management.component.ts
import { Component, OnInit } from '@angular/core';
import { DossierRecouvrementService } from 'src/app/shared/services/dossier-recouvrement.service';
import { DossierRecouvrement } from 'src/app/shared/models/dossier-recouvrement.model';
import { HttpErrorResponse } from '@angular/common/http';
import { CautionsFileService } from 'src/app/shared/services/cautions-file.service';
import { RoleService } from 'src/app/shared/services/role.service';

@Component({
  selector: 'app-cautions-file-management',
  templateUrl: './cautions-file-management.component.html',
  styleUrls: ['./cautions-file-management.component.css'],
})
export class CautionsFileManagementComponent implements OnInit {
  dossiers: DossierRecouvrement[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private dossierService: DossierRecouvrementService,
    private cautionsFileService: CautionsFileService,
    public roleService: RoleService
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

  // Gérer la sélection d'un fichier de caution
  onCautionsFileSelected(event: any, dossier: DossierRecouvrement): void {
    const file = event.target.files[0];
    if (file) {
      dossier.selectedCautionsFile = file; // Stocker le fichier sélectionné
    }
  }

  // Uploader un fichier de caution
  uploadCautionsFile(dossier: DossierRecouvrement): void {
    if (dossier.selectedCautionsFile) {
      this.isLoading = true;
      this.errorMessage = null;
      this.successMessage = null;

      this.cautionsFileService.uploadCautionsFile(dossier.id, dossier.selectedCautionsFile).subscribe({
        next: (response) => {
          console.log('Fichier de caution uploadé avec succès', response);
          this.successMessage = 'Fichier de caution uploadé avec succès';
          this.loadDossiers(); // Recharger la liste des dossiers
        },
        error: (err) => {
          console.error('Erreur lors de l\'upload du fichier de caution', err);
          this.errorMessage = 'Erreur lors de l\'upload du fichier de caution';
        },
        complete: () => {
          this.isLoading = false;
        },
      });
    }
  }

  // Visualiser un fichier de caution
  viewCautionsFile(dossier: DossierRecouvrement): void {
    if (dossier.cautionsFile) {
      const encodedUrl = encodeURI(dossier.cautionsFile);
      window.open(encodedUrl, '_blank');
    } else {
      console.error('Aucun fichier trouvé pour ce dossier.');
      alert('Aucun fichier trouvé pour ce dossier.');
    }
  }

  // Supprimer un fichier de caution
  deleteCautionsFile(dossier: DossierRecouvrement): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fichier de caution ?')) {
      this.isLoading = true;
      this.errorMessage = null;
      this.successMessage = null;

      this.cautionsFileService.deleteCautionsFile(dossier.id).subscribe({
        next: () => {
          this.successMessage = 'Fichier de caution supprimé avec succès';
          this.loadDossiers(); // Recharger la liste des dossiers
        },
        error: (err: HttpErrorResponse) => {
          console.error('Erreur lors de la suppression du fichier de caution', err);
          this.errorMessage = 'Erreur lors de la suppression du fichier de caution';
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