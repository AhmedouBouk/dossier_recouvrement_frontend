// src/app/pages/credits-file-management/credits-file-management.component.ts
import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

import { DossierRecouvrement } from 'src/app/shared/models/dossier-recouvrement.model';
import { CreditFile } from 'src/app/shared/models/credit-file.model';
import { DossierRecouvrementService } from 'src/app/shared/services/dossier-recouvrement.service';
import { CreditsFileService } from 'src/app/shared/services/credits-file.service';
import { AuthService } from 'src/app/auth/auth.service';
import { RoleService } from 'src/app/shared/services/role.service';

// Extended DossierRecouvrement interface - override creditsFile property
interface ExtendedDossierRecouvrement extends Omit<DossierRecouvrement, 'creditsFile'> {
  creditsFile?: CreditFile[];
}

@Component({
  selector: 'app-credits-file-management',
  templateUrl: './credits-file-management.component.html',
  styleUrls: ['./credits-file-management.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
})
export class CreditsFileManagementComponent implements OnInit {
  @Input() dossierId: number | null = null;
  dossiers: ExtendedDossierRecouvrement[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  searchTerm = '';
  readonly newCreditFileForm: FormGroup;
  editingCreditFile: CreditFile | null = null;
  
  // New properties for the add form
  showAddForm = false;
  selectedFile: File | null = null;
  selectedFileName: string | null = null;
  currentDossierId: number | null = null;
  formSubmitted = false;

  constructor(
    private dossierService: DossierRecouvrementService,
    private creditsFileService: CreditsFileService,
    public authService: AuthService,
    public roleService: RoleService,
    private readonly fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.newCreditFileForm = this.fb.group({
      title: ['', Validators.required],
      creditNumber: [''],
      montant: [''],
      dateEcheance: ['']
    });
  }

  ngOnInit(): void {
    this.loadDossiers();
  }

  loadDossiers(): void {
    this.isLoading = true;
    this.dossierService.getDossiers().subscribe({
      next: (data: DossierRecouvrement[]) => {
        // Transform the data to match ExtendedDossierRecouvrement
        this.dossiers = data.map(dossier => ({
          ...dossier,
          creditsFile: []
        })) as ExtendedDossierRecouvrement[];
        
        // For each dossier, load its credit files separately
        if (this.dossierId) {
          // If we have a specific dossier ID, only load credits for that dossier
          this.loadCreditFilesForDossier(this.dossierId);
        } else {
          // Otherwise load credits for all dossiers
          this.dossiers.forEach(dossier => {
            this.loadCreditFilesForDossier(dossier.id);
          });
        }
        
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur lors du chargement des dossiers', err);
        this.errorMessage = 'Erreur lors du chargement des dossiers';
        this.isLoading = false;
      },
    });
  }

  /**
   * Loads credit files for a specific dossier
   * @param dossierId The ID of the dossier to load credit files for
   */
  loadCreditFilesForDossier(dossierId: number): void {
    this.creditsFileService.getCreditFilesByDossierId(dossierId).subscribe({
      next: (creditFiles: any[]) => {
        // Find the dossier in our array and update its creditsFile property
        const dossierIndex = this.dossiers.findIndex(d => d.id === dossierId);
        if (dossierIndex !== -1) {
          // Create a new dossier object with updated creditsFile to trigger change detection
          this.dossiers = [
            ...this.dossiers.slice(0, dossierIndex),
            {
              ...this.dossiers[dossierIndex],
              creditsFile: creditFiles
            },
            ...this.dossiers.slice(dossierIndex + 1)
          ];
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error(`Error loading credit files for dossier ${dossierId}`, err);
      }
    });
  }

  getFileNameFromUrl(url: string | null): string {
    if (!url) return '';
    const parts = url.split('/');
    return parts[parts.length - 1];
  }

  // Single implementation of getFileName method
  getFileName(filePath: string | null): string {
    if (!filePath) return 'Aucun fichier';
    // Handle both forward and backslashes
    const parts = filePath.split(/[\/\\]/);
    return parts[parts.length - 1] || 'Aucun fichier';
  }

  getDossierById(dossierId: number): ExtendedDossierRecouvrement | undefined {
    return this.dossiers.find((dossier) => dossier.id === dossierId);
  }

  // New methods for the add form
  openAddForm(dossierId: number): void {
    this.currentDossierId = dossierId;
    this.showAddForm = true;
    this.newCreditFileForm.reset();
    this.selectedFile = null;
    this.selectedFileName = null;
    this.formSubmitted = false;
    this.errorMessage = null;
    this.successMessage = null;
  }

  closeAddForm(): void {
    this.showAddForm = false;
    this.currentDossierId = null;
    this.selectedFile = null;
    this.selectedFileName = null;
    this.formSubmitted = false;
    this.newCreditFileForm.reset();
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
      
      // Auto-fill title with filename (without extension) if title is empty
      if (!this.newCreditFileForm.get('title')?.value) {
        const nameWithoutExtension = file.name.split('.').slice(0, -1).join('.');
        this.newCreditFileForm.patchValue({ title: nameWithoutExtension });
      }
    }
  }

  submitNewCreditFile(): void {
    this.formSubmitted = true;
    
    if (this.newCreditFileForm.invalid || !this.selectedFile || !this.currentDossierId) {
      if (!this.selectedFile) {
        this.errorMessage = 'Veuillez sélectionner un fichier.';
      }
      return;
    }

    const formValue = this.newCreditFileForm.value;
    const title = formValue.title?.trim();
    if (!title) {
      this.errorMessage = 'Veuillez saisir un titre pour le fichier de crédit.';
      return;
    }

    const creditNumber = formValue.creditNumber || undefined;
    const montantStr = formValue.montant;
    const montant = montantStr ? parseFloat(montantStr) : undefined;
    const dateEcheanceStr = formValue.dateEcheance;
    const dateEcheance = dateEcheanceStr ? new Date(dateEcheanceStr) : undefined;

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.creditsFileService.uploadCreditFile(
      this.currentDossierId,
      title,
      this.selectedFile,
      creditNumber,
      montant,
      dateEcheance
    )
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
        next: (newCreditFile: CreditFile) => {
          this.successMessage = 'Fichier de crédit ajouté avec succès.';
          
          // Update the dossier in our list
          const dossierIndex = this.dossiers.findIndex(d => d.id === this.currentDossierId);
          if (dossierIndex !== -1) {
            const updatedDossier = { ...this.dossiers[dossierIndex] };
            if (!updatedDossier.creditsFile) {
              updatedDossier.creditsFile = [];
            }
            updatedDossier.creditsFile = [...updatedDossier.creditsFile, newCreditFile];
            
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
          this.errorMessage = "Erreur lors de l'ajout du fichier de crédit.";
        },
      });
  }

  // Keep the old method for backward compatibility (if needed elsewhere)
  onFileUpload(event: any, dossierId: number): void {
    // This method is now deprecated in favor of the new form approach
    // but kept for compatibility if used elsewhere
    this.openAddForm(dossierId);
  }

  viewCreditFile(creditFile: CreditFile, download: boolean = false): void {
    if (!creditFile.filePath) {
      alert('Aucun fichier trouvé pour ce crédit.');
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.creditsFileService.downloadCreditFile(creditFile.id, download)
      .subscribe({
        next: (blob: Blob) => {
          this.isLoading = false;
          
          // Check if the blob is empty or too small (likely an error)
          if (blob.size < 100) {
            // Try to read the blob as text to see if it contains an error message
            const reader = new FileReader();
            reader.onload = () => {
              try {
                const text = reader.result as string;
                console.error('Server response:', text);
                this.errorMessage = `Erreur: ${text}`;
              } catch (e) {
                this.errorMessage = 'Impossible de charger le fichier: format invalide';
              }
            };
            reader.readAsText(blob);
            return;
          }
          
          const blobUrl = URL.createObjectURL(blob);
          if (download) {
            const a = document.createElement('a');
            a.href = blobUrl;
            // Add null check for filePath
            const fileName = creditFile.filePath ? creditFile.filePath.split('/').pop() : null;
            a.download = fileName ?? 'credit.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
          } else {
            window.open(blobUrl, '_blank');
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Erreur lors du téléchargement:', error);
          
          // Extract more detailed error information
          let errorMsg = 'Impossible de charger le fichier.';
          if (error.error instanceof Blob) {
            // Try to read the error blob as text
            const reader = new FileReader();
            reader.onload = () => {
              try {
                const errorText = reader.result as string;
                console.error('Error response content:', errorText);
                try {
                  const errorObj = JSON.parse(errorText);
                  errorMsg = errorObj.message || errorObj.error || errorText;
                } catch (e) {
                  errorMsg = errorText;
                }
                this.errorMessage = `Erreur: ${errorMsg}`;
              } catch (e) {
                this.errorMessage = errorMsg;
              }
            };
            reader.readAsText(error.error);
          } else {
            this.errorMessage = `Erreur: ${error.status} ${error.statusText} - ${error.message || 'Impossible de charger le fichier'}`;
          }
        }
      });
  }

  startEdit(creditFile: CreditFile): void {
    this.editingCreditFile = { ...creditFile };
    this.errorMessage = null;
  }

  cancelEdit(): void {
    this.editingCreditFile = null;
  }

  updateCreditFile(): void {
    if (!this.editingCreditFile) return;

    const title = this.editingCreditFile.title?.trim();
    if (!title) {
      this.errorMessage = 'Le titre du fichier de crédit est requis.';
      return;
    }

    this.isLoading = true;
    this.creditsFileService.updateCreditFile(this.editingCreditFile.id, this.editingCreditFile).subscribe({
      next: (updatedCreditFile) => {
        this.successMessage = 'Fichier de crédit mis à jour avec succès.';
        
        // Update the credit file in the dossier more reliably
        if (updatedCreditFile) {
          // Find the dossier that contains this credit file
          for (let i = 0; i < this.dossiers.length; i++) {
            const dossier = this.dossiers[i];
            if (dossier.creditsFile) {
              const creditIndex = dossier.creditsFile.findIndex(c => c.id === updatedCreditFile.id);
              if (creditIndex !== -1) {
                // Create a new dossier object with updated creditsFile array
                const updatedDossier = { ...dossier };
                updatedDossier.creditsFile = [
                  ...dossier.creditsFile.slice(0, creditIndex),
                  updatedCreditFile,
                  ...dossier.creditsFile.slice(creditIndex + 1)
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
        }
        
        // Clear editing state
        this.editingCreditFile = null;
        this.errorMessage = null;
        this.isLoading = false;
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = null;
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur lors de la mise à jour du fichier', err);
        this.errorMessage = 'Erreur lors de la mise à jour du fichier de crédit.';
        this.isLoading = false;
      },
    });
  }

  deleteCreditFile(creditFile: CreditFile): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce fichier de crédit ?')) return;

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.creditsFileService.deleteCreditFileById(creditFile.id).subscribe({
      next: () => {
        this.successMessage = 'Fichier de crédit supprimé avec succès.';
        
        // Remove the credit file from the dossier more reliably
        // Find the dossier that contains this credit file
        for (let i = 0; i < this.dossiers.length; i++) {
          const dossier = this.dossiers[i];
          if (dossier.creditsFile) {
            const creditIndex = dossier.creditsFile.findIndex(c => c.id === creditFile.id);
            if (creditIndex !== -1) {
              // Create a new dossier object with updated creditsFile array
              const updatedDossier = { ...dossier };
              updatedDossier.creditsFile = dossier.creditsFile.filter(c => c.id !== creditFile.id);
              
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
        console.error('Erreur lors de la suppression du fichier de crédit', err);
        this.errorMessage = 'Erreur lors de la suppression du fichier de crédit.';
        this.isLoading = false;
      },
    });
  }
  
  // Add these methods to help Angular track changes
  trackByCreditFileId(index: number, creditFile: CreditFile): any {
    return creditFile.id;
  }

  trackByDossierId(index: number, dossier: ExtendedDossierRecouvrement): any {
    return dossier.id;
  }
}