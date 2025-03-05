import { Component, OnInit } from '@angular/core';
import { DossierRecouvrement } from 'src/app/shared/models/dossier-recouvrement.model';
import { DossierRecouvrementService } from 'src/app/shared/services/dossier-recouvrement.service';

@Component({
  selector: 'app-garanties',
  templateUrl: './garanties.component.html',
  styleUrls: ['./garanties.component.css']
})
export class GarantiesComponent implements OnInit {
  dossiers: DossierRecouvrement[] = [];
  isLoading: boolean = false; // Ajoutez cette propriété
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private dossierService: DossierRecouvrementService) {}

  ngOnInit(): void {
    this.loadDossiers();
  }

  loadDossiers(): void {
    this.isLoading = true; // Activez l'état de chargement
    this.dossierService.getDossiersSansGarantie().subscribe({
      next: (data) => {
        this.dossiers = data;
        this.isLoading = false; // Désactivez l'état de chargement après le chargement des données
      },
      error: (err) => {
        console.error('Erreur lors du chargement des dossiers', err);
        this.errorMessage = 'Erreur lors du chargement des dossiers.';
        this.isLoading = false; // Désactivez l'état de chargement en cas d'erreur
      }
    });
  }

  onFileUpload(event: any, dossier: DossierRecouvrement): void {
    const file: File = event.target.files[0];
    if (file) {
      dossier.temporaryFile = file; // Stockez le fichier temporairement
    }
  }

  uploadGarantie(dossier: DossierRecouvrement): void {
    if (!dossier.temporaryFile || !dossier.garantiesTitre) {
      this.errorMessage = 'Veuillez sélectionner un fichier et saisir un titre.';
      return;
    }

    const formData = new FormData();
    formData.append('file', dossier.temporaryFile);
    formData.append('titre', dossier.garantiesTitre);

    this.isLoading = true; // Activez l'état de chargement pendant l'upload
    this.dossierService.uploadGarantie(dossier.id, formData).subscribe({
      next: (updatedDossier) => {
        this.successMessage = 'Garantie uploadée avec succès.';
        dossier.garantiesFile = updatedDossier.garantiesFile;
        dossier.temporaryFile = undefined;
        this.isLoading = false; // Désactivez l'état de chargement après l'upload
        this.loadDossiers(); // Rechargez les dossiers
      },
      error: (err) => {
        console.error('Erreur lors de l\'upload de la garantie', err);
        this.errorMessage = 'Erreur lors de l\'upload de la garantie.';
        this.isLoading = false; // Désactivez l'état de chargement en cas d'erreur
      }
    });
  }
}