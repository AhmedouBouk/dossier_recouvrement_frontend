import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
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
  styleUrls: ['./garanties.component.css']
})
export class GarantiesComponent implements OnInit {
  dossiers: DossierRecouvrement[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  editingGarantie: Garantie | null = null;
  readonly newGarantieForm: FormGroup;
  
  // New properties for the add form
  showAddForm = false;
  selectedFile: File | null = null;
  selectedFileName: string | null = null;
  currentDossierId: number | null = null;
  formSubmitted = false;

  constructor(
    private garantieService: GarantieService,
    private dossierService: DossierRecouvrementService,
    public authService: AuthService,
    public roleService: RoleService,
    private readonly fb: FormBuilder,
    private cdr: ChangeDetectorRef
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
        this.dossiers = [...data]; // Create new array reference
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des dossiers', err);
        this.errorMessage = 'Erreur lors du chargement des dossiers';
        this.isLoading = false;
        this.cdr.markForCheck();
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
    // Create a deep copy to avoid reference issues
    this.editingGarantie = { 
      ...garantie,
      titre: garantie.titre || ''
    };
    this.errorMessage = null;
    this.cdr.markForCheck();
  }

  cancelEdit(): void {
    this.editingGarantie = null;
    this.cdr.markForCheck();
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
        console.log('Garantie updated:', updatedGarantie); // Debug log
        
        // Create completely new array structure to ensure change detection
        this.dossiers = this.dossiers.map(dossier => {
          if (dossier.id === updatedGarantie.dossierId && dossier.garanties) {
            const newGaranties = dossier.garanties.map(garantie => 
              garantie.id === updatedGarantie.id 
                ? { ...garantie, ...updatedGarantie } // Merge to preserve all properties
                : { ...garantie } // Create new reference even for unchanged items
            );
            
            return {
              ...dossier,
              garanties: newGaranties
            };
          }
          return { ...dossier }; // Create new reference for all dossiers
        });
        
        this.successMessage = 'Titre de la garantie mis à jour avec succès.';
        this.editingGarantie = null;
        this.errorMessage = null;
        this.isLoading = false;
        
        // Force change detection
        this.cdr.detectChanges();
        
        // Clear success message after 3 seconds
        
        window.location.reload();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur lors de la mise à jour du titre', err);
        this.errorMessage = 'Erreur lors de la mise à jour du titre de la garantie.';
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  // New methods for the add form
  openAddForm(dossierId: number): void {
    this.currentDossierId = dossierId;
    this.showAddForm = true;
    this.newGarantieForm.reset();
    this.selectedFile = null;
    this.selectedFileName = null;
    this.formSubmitted = false;
    this.errorMessage = null;
    this.successMessage = null;
    this.cdr.markForCheck();
  }

  closeAddForm(): void {
    this.showAddForm = false;
    this.currentDossierId = null;
    this.selectedFile = null;
    this.selectedFileName = null;
    this.formSubmitted = false;
    this.newGarantieForm.reset();
    this.cdr.markForCheck();
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
      
      // Auto-fill title with filename (without extension) if title is empty
      if (!this.newGarantieForm.get('titre')?.value) {
        const nameWithoutExtension = file.name.split('.').slice(0, -1).join('.');
        this.newGarantieForm.patchValue({ titre: nameWithoutExtension });
      }
      this.cdr.markForCheck();
    }
  }

  submitNewGarantie(): void {
    this.formSubmitted = true;
    
    if (this.newGarantieForm.invalid || !this.selectedFile || !this.currentDossierId) {
      if (!this.selectedFile) {
        this.errorMessage = 'Veuillez sélectionner un fichier.';
      }
      return;
    }

    const titre = this.newGarantieForm.get('titre')?.value?.trim();
    if (!titre) {
      this.errorMessage = 'Veuillez saisir un titre pour la garantie.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.garantieService
      .uploadGarantie(this.currentDossierId, this.selectedFile, titre)
      .subscribe({
        next: (updatedDossier) => {
          // Create completely new array structure
          this.dossiers = this.dossiers.map(d => 
            d.id === updatedDossier.id ? { ...updatedDossier } : { ...d }
          );
          
          this.successMessage = 'Garantie ajoutée avec succès.';
          this.closeAddForm();
          this.isLoading = false;
          
          // Force change detection
          this.cdr.detectChanges();
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            this.successMessage = null;
            this.cdr.markForCheck();
          }, 3000);
        },
        error: (err: HttpErrorResponse) => {
          console.error("Erreur lors de l'upload", err);
          this.errorMessage = "Erreur lors de l'ajout de la garantie.";
          this.isLoading = false;
          this.cdr.markForCheck();
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
            const fileName = garantie.filePath ? garantie.filePath.split('/').pop() : null;
            a.download = fileName ?? 'garantie.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } else {
            window.open(blobUrl, '_blank');
          }
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Erreur:', error);
          this.errorMessage = 'Impossible de charger le fichier.';
          this.cdr.markForCheck();
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
        // Create completely new array structure
        this.dossiers = this.dossiers.map(dossier => {
          if (dossier.id === garantie.dossierId && dossier.garanties) {
            return {
              ...dossier,
              garanties: dossier.garanties.filter(g => g.id !== garantie.id).map(g => ({ ...g }))
            };
          }
          return { ...dossier };
        });
        
        this.successMessage = 'Garantie supprimée avec succès.';
        this.isLoading = false;
        
        // Force change detection
        this.cdr.detectChanges();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = null;
          this.cdr.markForCheck();
        }, 3000);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur lors de la suppression de la garantie', err);
        this.errorMessage = 'Erreur lors de la suppression de la garantie.';
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }
  
  addNewGarantie(dossierId: number): void {
    this.openAddForm(dossierId);
  }

  // Add this method to help Angular track changes
  trackByGarantieId(index: number, garantie: Garantie): any {
    return garantie.id;
  }

  trackByDossierId(index: number, dossier: DossierRecouvrement): any {
    return dossier.id;
  }

  // Keep the old methods for backward compatibility
  onFileUpload(event: any, dossierId: number): void {
    this.openAddForm(dossierId);
  }

  uploadGarantie(dossierId: number): void {
    // This method is now handled by submitNewGarantie
  }
}