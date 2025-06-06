import { Component, OnInit } from '@angular/core';
import { DossierRecouvrement } from 'src/app/shared/models/dossier-recouvrement.model';
import { Garantie } from 'src/app/shared/models/garantie.model';
import { GarantieService } from 'src/app/shared/services/garantie.service';
import { DossierRecouvrementService } from 'src/app/shared/services/dossier-recouvrement.service';
import { AuthService } from 'src/app/auth/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { RoleService } from 'src/app/shared/services/role.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
  editingGarantie: Garantie | null = null;
  readonly newGarantieForm: FormGroup;
  readonly selectedFiles = new Map<number, File>();

  constructor(
    private garantieService: GarantieService,
    private dossierService: DossierRecouvrementService,
    public authService: AuthService,
    public roleService: RoleService,
    private readonly fb: FormBuilder
  ) {
    this.newGarantieForm = this.fb.group({
      titre: ['', Validators.required]
    });
  }

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

  getFileName(filePath: string | null): string {
    if (!filePath) return 'Aucun fichier';
    // Handle both forward and backslashes
    const parts = filePath.split(/[\/\\]/);
    return parts[parts.length - 1] || 'Aucun fichier';
  }
  
  getDossierById(dossierId: number): DossierRecouvrement | undefined {
    return this.dossiers.find(dossier => dossier.id === dossierId);
  }

  startEdit(garantie: Garantie): void {
    this.editingGarantie = { ...garantie };
    this.errorMessage = null;
  }

  cancelEdit(): void {
    this.editingGarantie = null;
  }

  updateGarantie(): void {
    if (!this.editingGarantie) return;

    const titre = this.editingGarantie.titre?.trim();
    if (!titre) {
      this.errorMessage = 'Le titre de la garantie est requis.';
      return;
    }

    // Check if ID exists
    if (!this.editingGarantie.id) {
      this.errorMessage = 'ID de garantie invalide.';
      return;
    }

    this.isLoading = true;
    this.garantieService.updateGarantieTitre(this.editingGarantie.id, titre).subscribe({
      next: (updatedGarantie) => {
        this.successMessage = 'Titre de la garantie mis à jour avec succès.';
        
        // Update the garantie in the dossier
        if (updatedGarantie && updatedGarantie.dossierId) {
          const dossier = this.getDossierById(updatedGarantie.dossierId);
          if (dossier && dossier.garanties) {
            const garantieIndex = dossier.garanties.findIndex(g => g.id === updatedGarantie.id);
            if (garantieIndex !== -1) {
              dossier.garanties[garantieIndex] = updatedGarantie;
            }
          }
        }
        
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

  onFileUpload(event: any, dossierId: number): void {
    const file: File = event.target.files[0];
    if (!file) return;
    
    // Store the file temporarily
    this.selectedFiles.set(dossierId, file);
    
    // Show the new garantie form
    this.newGarantieForm.patchValue({ titre: file.name.split('.')[0] });
    
    // Upload immediately
    this.uploadGarantie(dossierId);
  }

  uploadGarantie(dossierId: number): void {
    const file = this.selectedFiles.get(dossierId);
    if (!file) {
      this.errorMessage = 'Veuillez sélectionner un fichier.';
      return;
    }

    // Get title from form or use filename as default
    const titre = this.newGarantieForm.get('titre')?.value ?? file.name.split('.')[0];
    
    if (!titre.trim()) {
      this.errorMessage = "Veuillez saisir un titre pour la garantie.";
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.garantieService
      .uploadGarantie(dossierId, file, titre)
      .subscribe({
        next: (updatedDossier) => {
          this.successMessage = 'Garantie uploadée avec succès.';
          
          // Update the dossier in our list
          const index = this.dossiers.findIndex(d => d.id === updatedDossier.id);
          if (index !== -1) {
            this.dossiers[index] = updatedDossier;
          }
          
          // Clear the form and selected file
          this.newGarantieForm.reset();
          this.selectedFiles.delete(dossierId);
          
          this.isLoading = false;
        },
        error: (err: HttpErrorResponse) => {
          console.error("Erreur lors de l'upload", err);
          this.errorMessage = "Erreur lors de l'upload de la garantie.";
          this.isLoading = false;
        },
      });
  }

  viewGarantieFile(garantie: Garantie, download: boolean = false): void {
    if (!garantie.filePath) {
      alert('Aucun fichier trouvé pour cette garantie.');
      return;
    }

    if (!garantie.id) {
      alert('ID de garantie invalide.');
      return;
    }

    this.isLoading = true;
    this.garantieService.getGarantiePdf(garantie.id)
      .subscribe({
        next: (blob) => {
          this.isLoading = false;
          const blobUrl = URL.createObjectURL(blob);
          if (download) {
            const a = document.createElement('a');
            a.href = blobUrl;
            // Add null check for filePath
            const fileName = garantie.filePath ? garantie.filePath.split('/').pop() : null;
            a.download = fileName ?? 'garantie.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } else {
            window.open(blobUrl, '_blank');
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Erreur:', error);
          this.errorMessage = 'Impossible de charger le fichier.';
        }
      });
  }

  deleteGarantie(garantie: Garantie): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette garantie ?')) return;

    if (!garantie.id) {
      this.errorMessage = 'ID de garantie invalide.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.garantieService.deleteGarantie(garantie.id).subscribe({
      next: () => {
        this.successMessage = 'Garantie supprimée avec succès.';
        
        // Remove the garantie from the dossier
        if (garantie.dossierId) {
          const dossier = this.getDossierById(garantie.dossierId);
          if (dossier && dossier.garanties) {
            dossier.garanties = dossier.garanties.filter(g => g.id !== garantie.id);
          }
        }
        
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur lors de la suppression de la garantie', err);
        this.errorMessage = 'Erreur lors de la suppression de la garantie.';
        this.isLoading = false;
      },
    });
  }
  
  addNewGarantie(dossierId: number): void {
    // Show form for adding a new garantie
    this.newGarantieForm.reset();
    // Logic for adding new garantie will be implemented in the template
  }
}
