import { Component, OnInit } from '@angular/core';
import { DossierRecouvrement } from 'src/app/shared/models/dossier-recouvrement.model';
import { GarantieService } from 'src/app/shared/services/garantie.service';
import { HttpErrorResponse } from '@angular/common/http';
import { DossierRecouvrementService } from 'src/app/shared/services/dossier-recouvrement.service';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-garanties',
  templateUrl: './garanties.component.html',
  styleUrls: ['./garanties.component.css'],
})
export class GarantiesComponent implements OnInit {
  dossiers: DossierRecouvrement[] = [];
  isLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  editingGarantie: DossierRecouvrement | null = null; // Dossier en cours d'édition

  constructor(private garantieService: GarantieService,    private dossierService: DossierRecouvrementService,        public authService:AuthService,
  
  ) {}

  ngOnInit(): void {
    this.loadDossiers();
  }

  // Charger la liste des dossiers sans garantie
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
  getFileNameFromUrl(url: string | null): string {
    if (!url) {
      return 'Aucun fichier';
    }
    // Extraire le nom du fichier à partir de l'URL
    const fileName = url.split('/').pop() || 'Aucun fichier';
    return fileName;
  }
  startEdit(dossier: DossierRecouvrement): void {
    this.editingGarantie = { ...dossier }; // Crée une copie du dossier pour l'édition
  }

  // Annuler l'édition
  cancelEdit(): void {
    this.editingGarantie = null;
  }

  // Sauvegarder les modifications du titre de la garantie
  updateGarantie(dossier: DossierRecouvrement): void {
    if (!this.editingGarantie) return;

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.garantieService.updateGarantie(dossier.id, this.editingGarantie).subscribe({
      next: (updatedDossier) => {
        this.successMessage = 'Titre de la garantie mis à jour avec succès.';
        const index = this.dossiers.findIndex((d) => d.id === updatedDossier.id);
        if (index !== -1) {
          this.dossiers[index] = updatedDossier; // Mettre à jour le dossier dans la liste
        }
        this.editingGarantie = null; // Quitter le mode édition
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur lors de la mise à jour du titre de la garantie', err);
        this.errorMessage = 'Erreur lors de la mise à jour du titre de la garantie.';
        this.isLoading = false;
      },
    });
  }

  // Gérer la sélection d'un fichier
  onFileUpload(event: any, dossier: DossierRecouvrement): void {
    const file: File = event.target.files[0];
    if (file) {
      dossier.temporaryFile = file; // Stocker le fichier temporairement
    }
  }

  // Uploader un fichier de garantie
  uploadGarantie(dossier: DossierRecouvrement): void {
    if (!dossier.temporaryFile || !dossier.garantiesTitre) {
      this.errorMessage = 'Veuillez sélectionner un fichier et saisir un titre.';
      return;
    }

    this.isLoading = true;
    this.garantieService.uploadGarantie(dossier.id, dossier.temporaryFile, dossier.garantiesTitre).subscribe({
      next: (response) => {
        this.successMessage = 'Garantie uploadée avec succès.';
        dossier.garantiesFile = response.garantiesFile; // Mettre à jour le chemin du fichier
        dossier.temporaryFile = undefined; // Réinitialiser le fichier temporaire
        this.isLoading = false;
        this.loadDossiers(); // Recharger la liste des dossiers
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur lors de l\'upload de la garantie', err);
        this.errorMessage = 'Erreur lors de l\'upload de la garantie.';
        this.isLoading = false;
      },
    });
  }

  // Visualiser un fichier de garantie
  viewGarantieFile(dossier: DossierRecouvrement, download: boolean = false): void {
    if (!dossier.garantiesFile) {
      alert('Aucun fichier trouvé pour ce dossier.');
      return;
    }
  
    const fileUrl = this.garantieService.getFullFileUrl(dossier.garantiesFile);
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
        a.download = dossier.garantiesFile.split('/').pop() || 'file.pdf'; // Nom du fichier
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
  // Supprimer un fichier de garantie
  deleteGarantieFile(dossier: DossierRecouvrement): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fichier de garantie ?')) {
      this.isLoading = true;
      this.errorMessage = null;
      this.successMessage = null;
  
      this.garantieService.deleteGarantieFile(dossier.id).subscribe({
        next: () => {
          this.successMessage = 'Fichier de garantie supprimé avec succès.';
          dossier.garantiesFile = ""; // Utilisez une chaîne vide au lieu de null
          this.isLoading = false;
          this.loadDossiers(); // Recharger la liste des dossiers
        },
        error: (err: HttpErrorResponse) => {
          console.error('Erreur lors de la suppression du fichier', err);
          this.errorMessage = 'Erreur lors de la suppression du fichier.';
          this.isLoading = false;
        },
      });
    }
  }
}