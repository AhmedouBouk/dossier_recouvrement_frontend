import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DossierRecouvrement } from 'src/app/shared/models/dossier-recouvrement.model';
import { Garantie } from 'src/app/shared/models/garantie.model';
import { GarantieService } from 'src/app/shared/services/garantie.service';
import { DossierRecouvrementService } from 'src/app/shared/services/dossier-recouvrement.service';
import { AuthService } from 'src/app/auth/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { RoleService } from 'src/app/shared/services/role.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

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
  readonly newGarantieForm: FormGroup;
  readonly editGarantieForm: FormGroup;
  
  // Types de garantie disponibles
  typesGarantie: string[] = [
    'Hypothèque',
    'Nantissement',
    'Caution personnelle',
    'Caution bancaire',
    'Gage',
    'Assurance',
    'Autre'
  ];
  
  // Properties for forms
  showAddForm = false;
  showEditForm = false;
  selectedFile: File | null = null;
  selectedFileName: string | null = null;
  currentDossierId: number | null = null;
  currentGarantieId: number | null = null;
  formSubmitted = false;

  constructor(
    private readonly garantieService: GarantieService,
    private readonly dossierService: DossierRecouvrementService,
    public authService: AuthService,
    public roleService: RoleService,
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.newGarantieForm = this.fb.group({
      titre: ['', Validators.required],
      typeGarantie: [''],
      valeurGarantie: [null]
    });
    
    this.editGarantieForm = this.fb.group({
      titre: ['', Validators.required],
      typeGarantie: [''],
      valeurGarantie: [null]
    });
  }

  ngOnInit(): void {
    this.loadDossiers();
  }

  loadDossiers(): void {
    this.isLoading = true;
    this.dossierService.getDossiers().subscribe({
      next: (data: DossierRecouvrement[]) => {
        // Create new array reference to trigger change detection
        this.dossiers = [...data];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des dossiers', err);
        this.errorMessage = 'Erreur lors du chargement des dossiers';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  getFileNameFromUrl(url: string | null): string {
    if (!url) return 'Aucun fichier';
    return url.split('/').pop() ?? 'Aucun fichier';
  }

  getFileName(filePath: string | null): string {
    if (!filePath) return 'Aucun fichier';
    const parts = filePath.split(/[/\\]/);
    return parts[parts.length - 1] ?? 'Aucun fichier';
  }
  
  getDossierById(dossierId: number): DossierRecouvrement | undefined {
    return this.dossiers.find(dossier => dossier.id === dossierId);
  }

  // Open edit form modal
  openEditForm(garantie: Garantie): void {
    this.currentGarantieId = garantie.id ?? null;
    this.currentDossierId = garantie.dossierId ?? null;
    this.showEditForm = true;
    
    // Fill form with existing data
    this.editGarantieForm.patchValue({
      titre: garantie.titre ?? '',
      typeGarantie: garantie.typeGarantie ?? '',
      valeurGarantie: garantie.valeurGarantie ?? null
    });
    
    this.errorMessage = null;
    this.successMessage = null;
    this.formSubmitted = false;
    this.cdr.detectChanges();
  }
  
  // Close edit form modal
  closeEditForm(): void {
    this.showEditForm = false;
    this.currentGarantieId = null;
    this.currentDossierId = null;
    this.editGarantieForm.reset();
    this.formSubmitted = false;
    this.cdr.detectChanges();
  }

  // Submit edit form - Using the same pattern as credits component
  submitEditGarantie(): void {
    this.formSubmitted = true;
    
    if (this.editGarantieForm.invalid || !this.currentGarantieId) {
      return;
    }

    const formValue = this.editGarantieForm.value;
    const titre = formValue.titre?.trim();
    if (!titre) {
      this.errorMessage = 'Le titre de la garantie est requis.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    
    const formData = new FormData();
    formData.append('titre', titre);
    
    const typeGarantie = formValue.typeGarantie;
    const valeurGarantie = formValue.valeurGarantie;
    
    if (typeGarantie) {
      formData.append('typeGarantie', typeGarantie);
    }
    
    if (valeurGarantie !== null && valeurGarantie !== '') {
      formData.append('valeurGarantie', valeurGarantie);
    }
    
    this.garantieService.updateGarantie(this.currentGarantieId, formData)
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
        next: (updatedGarantie) => {
          this.successMessage = 'Garantie mise à jour avec succès.';
          
          // Update the garantie in the dossier using the same pattern as credits
          for (let i = 0; i < this.dossiers.length; i++) {
            const dossier = this.dossiers[i];
            if (dossier.garanties) {
              const garantieIndex = dossier.garanties.findIndex(g => g.id === updatedGarantie.id);
              if (garantieIndex !== -1) {
                // Create a new dossier object with updated garanties array
                const updatedDossier = { ...dossier };
                updatedDossier.garanties = [
                  ...dossier.garanties.slice(0, garantieIndex),
                  updatedGarantie,
                  ...dossier.garanties.slice(garantieIndex + 1)
                ];
                
                // Update the dossiers array
                this.dossiers = [
                  ...this.dossiers.slice(0, i),
                  updatedDossier,
                  ...this.dossiers.slice(i + 1)
                ];
                break;
              }
            }
          }
          
          // Close the form
          this.closeEditForm();
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            this.successMessage = null;
            this.cdr.detectChanges();
          }, 1000);
        },
        error: (err: HttpErrorResponse) => {
          console.error('Erreur lors de la mise à jour', err);
          this.errorMessage = 'Erreur lors de la mise à jour de la garantie';
        },
      });
  }

  // Open add form modal
  openAddForm(dossierId: number): void {
    this.currentDossierId = dossierId;
    this.showAddForm = true;
    this.newGarantieForm.reset();
    this.selectedFile = null;
    this.selectedFileName = null;
    this.formSubmitted = false;
    this.errorMessage = null;
    this.successMessage = null;
    this.cdr.detectChanges();
  }

  // Close add form modal
  closeAddForm(): void {
    this.showAddForm = false;
    this.currentDossierId = null;
    this.selectedFile = null;
    this.selectedFileName = null;
    this.formSubmitted = false;
    this.newGarantieForm.reset();
    this.cdr.detectChanges();
  }

  // Handle file selection
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
      this.cdr.detectChanges();
    }
  }

  // Submit new garantie form - Using the same pattern as credits component
  submitNewGarantie(): void {
    this.formSubmitted = true;
    
    if (this.newGarantieForm.invalid || !this.selectedFile || !this.currentDossierId) {
      if (!this.selectedFile) {
        this.errorMessage = 'Veuillez sélectionner un fichier.';
      }
      return;
    }

    const formValue = this.newGarantieForm.value;
    const titre = formValue.titre?.trim();
    if (!titre) {
      this.errorMessage = 'Veuillez saisir un titre pour la garantie.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('titre', titre);
    
    const typeGarantie = formValue.typeGarantie;
    const valeurGarantie = formValue.valeurGarantie;
    
    if (typeGarantie) {
      formData.append('typeGarantie', typeGarantie);
    }
    
    if (valeurGarantie !== null && valeurGarantie !== '') {
      formData.append('valeurGarantie', valeurGarantie);
    }
    
    this.garantieService.uploadGarantie(this.currentDossierId, formData)
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
        next: (updatedDossier) => {
          this.successMessage = 'Garantie ajoutée avec succès.';
          
          // Update the dossier in our list using the same pattern as credits
          const dossierIndex = this.dossiers.findIndex(d => d.id === updatedDossier.id);
          if (dossierIndex !== -1) {
            // Create a new array to trigger change detection
            this.dossiers = [
              ...this.dossiers.slice(0, dossierIndex),
              updatedDossier,
              ...this.dossiers.slice(dossierIndex + 1)
            ];
          }
          
          // Close the form
          this.closeAddForm();
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            this.successMessage = null;
            this.cdr.detectChanges();
          }, 3000);
        },
        error: (err: HttpErrorResponse) => {
          console.error("Erreur lors de l'upload", err);
          this.errorMessage = "Erreur lors de l'ajout de la garantie.";
        },
      });
  }

  // View or download garantie file
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
            URL.revokeObjectURL(blobUrl);
          } else {
            window.open(blobUrl, '_blank');
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Erreur:', error);
          this.errorMessage = 'Impossible de charger le fichier.';
          this.cdr.detectChanges();
        }
      });
  }

  // Delete garantie - Using the same pattern as credits component
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
        
        // Remove the garantie from the dossier using the same pattern as credits
        for (let i = 0; i < this.dossiers.length; i++) {
          const dossier = this.dossiers[i];
          if (dossier.garanties) {
            const garantieIndex = dossier.garanties.findIndex(g => g.id === garantie.id);
            if (garantieIndex !== -1) {
              // Create a new dossier object with updated garanties array
              const updatedDossier = { ...dossier };
              updatedDossier.garanties = dossier.garanties.filter(g => g.id !== garantie.id);
              
              // Update the dossiers array
              this.dossiers = [
                ...this.dossiers.slice(0, i),
                updatedDossier,
                ...this.dossiers.slice(i + 1)
              ];
              break;
            }
          }
        }
        
        this.isLoading = false;
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = null;
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur lors de la suppression de la garantie', err);
        this.errorMessage = 'Erreur lors de la suppression de la garantie.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // Keyboard event handlers
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeAddForm();
    }
  }
  
  handleKeyDownEdit(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeEditForm();
    }
  }

  // Track by functions for ngFor performance
  trackByGarantieId(index: number, garantie: Garantie): any {
    return garantie.id;
  }

  trackByDossierId(index: number, dossier: DossierRecouvrement): any {
    return dossier.id;
  }

  // Legacy methods for backward compatibility
  addNewGarantie(dossierId: number): void {
    this.openAddForm(dossierId);
  }

  onFileUpload(event: any, dossierId: number): void {
    this.openAddForm(dossierId);
  }
}