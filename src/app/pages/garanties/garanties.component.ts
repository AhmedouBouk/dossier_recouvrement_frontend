import { Component, OnInit } from '@angular/core';
import { DossierRecouvrement } from 'src/app/shared/models/dossier-recouvrement.model';
import { GarantieService } from 'src/app/shared/services/garantie.service';
import { DossierRecouvrementService } from 'src/app/shared/services/dossier-recouvrement.service';
import { AuthService } from 'src/app/auth/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { RoleService } from 'src/app/shared/services/role.service';

@Component({
  selector: 'app-garanties',
  templateUrl: './garanties.component.html',
  styleUrls: ['./garanties.component.css'],
})
export class GarantiesComponent implements OnInit {
  dossiers: DossierRecouvrement[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  editingGarantie: DossierRecouvrement | null = null;

  constructor(
    private garantieService: GarantieService,
    private dossierService: DossierRecouvrementService,
    public authService: AuthService,
        public roleService: RoleService,
    
  ) {}

  ngOnInit(): void {
    this.loadDossiers();
  }

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
    if (!url) return 'Aucun fichier';
    return url.split('/').pop() || 'Aucun fichier';
  }

  startEdit(dossier: DossierRecouvrement): void {
    this.editingGarantie = { ...dossier };
    this.errorMessage = null;
  }

  cancelEdit(): void {
    this.editingGarantie = null;
  }

  updateGarantie(dossier: DossierRecouvrement): void {
    if (!this.editingGarantie) return;

    const titre = this.editingGarantie.garantiesTitre?.trim();
    if (!titre) {
      this.errorMessage = 'Le titre de la garantie est requis.';
      return;
    }

    this.isLoading = true;
    this.garantieService.updateGarantie(dossier.id, this.editingGarantie).subscribe({
      next: (updatedDossier) => {
        this.successMessage = 'Titre de la garantie mis à jour avec succès.';
        const index = this.dossiers.findIndex((d) => d.id === updatedDossier.id);
        if (index !== -1) this.dossiers[index] = updatedDossier;
        this.editingGarantie = null;
        this.errorMessage = null;
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur lors de la mise à jour du titre', err);
        this.errorMessage = 'Erreur lors de la mise à jour du titre de la garantie.';
        this.isLoading = false;
      },
    });
  }

 onFileUpload(event: any, dossier: DossierRecouvrement): void {
  const file: File = event.target.files[0];
  if (!file) return;

  if (!dossier.garantiesTitre || dossier.garantiesTitre.trim() === '') {
    this.errorMessage = "Veuillez d'abord saisir un titre pour la garantie.";
    this.startEdit(dossier); // active le champ d'édition automatiquement
    return;
  }

  dossier.temporaryFile = file;
  this.uploadGarantie(dossier); // upload immédiat
}

  uploadGarantie(dossier: DossierRecouvrement): void {
    if (!dossier.garantiesTitre || dossier.garantiesTitre.trim() === '') {
      this.errorMessage = "Veuillez d'abord saisir un titre pour la garantie.";
      this.startEdit(dossier); // Passe en mode édition automatiquement
      return;
    }

    if (!dossier.temporaryFile) {
      this.errorMessage = 'Veuillez sélectionner un fichier.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.garantieService
      .uploadGarantie(dossier.id, dossier.temporaryFile, dossier.garantiesTitre)
      .subscribe({
        next: (response) => {
          this.successMessage = 'Garantie uploadée avec succès.';
          dossier.garantiesFile = response.garantiesFile;
          dossier.temporaryFile = undefined;
          this.loadDossiers();
          this.isLoading = false;
        },
        error: (err: HttpErrorResponse) => {
          console.error("Erreur lors de l'upload", err);
          this.errorMessage = "Erreur lors de l'upload de la garantie.";
          this.isLoading = false;
        },
      });
  }

  viewGarantieFile(dossier: DossierRecouvrement, download: boolean = false): void {
    if (!dossier.garantiesFile) {
      alert('Aucun fichier trouvé pour ce dossier.');
      return;
    }

    const fileUrl = this.garantieService.getFullFileUrl(dossier.garantiesFile);
    const token = this.authService.getToken();

    fetch(fileUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error('Erreur lors du chargement du fichier');
        return response.blob();
      })
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        if (download) {
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = dossier.garantiesFile.split('/').pop() || 'file.pdf';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else {
          window.open(blobUrl, '_blank');
        }
      })
      .catch((error) => {
        console.error('Erreur:', error);
        alert('Impossible de charger le fichier.');
      });
  }

  deleteGarantieFile(dossier: DossierRecouvrement): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce fichier de garantie ?')) return;

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.garantieService.deleteGarantieFile(dossier.id).subscribe({
      next: () => {
        this.successMessage = 'Fichier supprimé avec succès.';
        dossier.garantiesFile = '';
        this.loadDossiers();
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur lors de la suppression du fichier', err);
        this.errorMessage = 'Erreur lors de la suppression du fichier.';
        this.isLoading = false;
      },
    });
  }
}
