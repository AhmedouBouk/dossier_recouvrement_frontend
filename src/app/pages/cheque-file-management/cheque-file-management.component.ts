import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { DossierRecouvrement } from 'src/app/shared/models/dossier-recouvrement.model';
import { ChequeFile } from 'src/app/shared/models/cheque-file.model';
import { ChequeFileService } from 'src/app/shared/services/cheque-file.service';
import { DossierRecouvrementService } from 'src/app/shared/services/dossier-recouvrement.service';
import { AuthService } from 'src/app/auth/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { RoleService } from 'src/app/shared/services/role.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-cheque-file-management',
  templateUrl: './cheque-file-management.component.html',
  styleUrls: ['./cheque-file-management.component.css'],
})
export class ChequeFileManagementComponent implements OnInit {
  @Input() dossierId: number | null = null;
  dossiers: DossierRecouvrement[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  editingChequeFile: ChequeFile | null = null;
  readonly newChequeFileForm: FormGroup;
  
  // New properties for the add form
  showAddForm = false;
  selectedFile: File | null = null;
  selectedFileName: string | null = null;
  currentDossierId: number | null = null;
  formSubmitted = false;

  constructor(
    private chequeFileService: ChequeFileService,
    private dossierService: DossierRecouvrementService,
    public authService: AuthService,
    public roleService: RoleService,
    private readonly fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.newChequeFileForm = this.fb.group({
      title: ['', Validators.required],
      chequeNumber: [''],
      montant: [''],
      dateEcheance: [''],
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

  startEdit(chequeFile: ChequeFile): void {
    this.editingChequeFile = { ...chequeFile };
    this.errorMessage = null;
  }

  cancelEdit(): void {
    this.editingChequeFile = null;
  }

  updateChequeFile(): void {
    if (!this.editingChequeFile) return;

    const title = this.editingChequeFile.title?.trim();
    if (!title) {
      this.errorMessage = 'Le titre du fichier de chèque est requis.';
      return;
    }

    // Check if ID exists
    if (!this.editingChequeFile.id) {
      this.errorMessage = 'ID de fichier de chèque invalide.';
      return;
    }

    this.isLoading = true;
    const updateDto = {
      title: title,
      chequeNumber: this.editingChequeFile.chequeNumber,
      montant: this.editingChequeFile.montant,
      dateEcheance: this.editingChequeFile.dateEcheance,
    };

    this.chequeFileService.updateChequeFile(this.editingChequeFile.id, updateDto).subscribe({
      next: (updatedChequeFile) => {
        this.successMessage = 'Titre du fichier de chèque mis à jour avec succès.';
        
        // Update the cheque file in the dossier more reliably
        if (updatedChequeFile && updatedChequeFile.dossierId) {
          // Create a completely new dossiers array to force change detection
          this.dossiers = this.dossiers.map(dossier => {
            if (dossier.id === updatedChequeFile.dossierId && dossier.chequeFiles) {
              return {
                ...dossier,
                chequeFiles: dossier.chequeFiles.map(chequeFile => 
                  chequeFile.id === updatedChequeFile.id ? { ...updatedChequeFile } : chequeFile
                )
              };
            }
            return dossier;
          });
        }
        
        // Clear editing state
        this.editingChequeFile = null;
        this.errorMessage = null;
        this.isLoading = false;
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = null;
        }, 1000);
        window.location.reload();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur lors de la mise à jour du titre', err);
        this.errorMessage = 'Erreur lors de la mise à jour du titre du fichier de chèque.';
        this.isLoading = false;
      },
    });
  }

  // New methods for the add form
  openAddForm(dossierId: number): void {
    this.currentDossierId = dossierId;
    this.showAddForm = true;
    this.newChequeFileForm.reset();
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
    this.newChequeFileForm.reset();
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
      
      // Auto-fill title with filename (without extension) if title is empty
      if (!this.newChequeFileForm.get('title')?.value) {
        const nameWithoutExtension = file.name.split('.').slice(0, -1).join('.');
        this.newChequeFileForm.patchValue({ title: nameWithoutExtension });
      }
    }
  }

  submitNewChequeFile(): void {
    this.formSubmitted = true;
    
    if (this.newChequeFileForm.invalid || !this.selectedFile || !this.currentDossierId) {
      if (!this.selectedFile) {
        this.errorMessage = 'Veuillez sélectionner un fichier.';
      }
      return;
    }

    const formValue = this.newChequeFileForm.value;
    const title = formValue.title?.trim();
    if (!title) {
      this.errorMessage = 'Veuillez saisir un titre pour le fichier de chèque.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.chequeFileService
      .uploadChequeFile(
        this.currentDossierId, 
        title, 
        this.selectedFile, 
        formValue.chequeNumber, 
        formValue.montant, 
        formValue.dateEcheance
      )
      .subscribe({
        next: (newChequeFile) => {
          this.successMessage = 'Fichier de chèque ajouté avec succès.';
          
          // Update the dossier in our list
          const dossierIndex = this.dossiers.findIndex(d => d.id === this.currentDossierId);
          if (dossierIndex !== -1) {
            const updatedDossier = { ...this.dossiers[dossierIndex] };
            if (!updatedDossier.chequeFiles) {
              updatedDossier.chequeFiles = [];
            }
            updatedDossier.chequeFiles = [...updatedDossier.chequeFiles, newChequeFile];
            
            // Create a new array to trigger change detection
            this.dossiers = [
              ...this.dossiers.slice(0, dossierIndex),
              updatedDossier,
              ...this.dossiers.slice(dossierIndex + 1)
            ];
          }
          
          // Close the form
          this.closeAddForm();
          this.isLoading = false;
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            this.successMessage = null;
          }, 3000);
        },
        error: (err: HttpErrorResponse) => {
          console.error("Erreur lors de l'upload", err);
          this.errorMessage = "Erreur lors de l'ajout du fichier de chèque.";
          this.isLoading = false;
        },
      });
  }

  // Keep the old method for backward compatibility (if needed elsewhere)
  onFileUpload(event: any, dossierId: number): void {
    // This method is now deprecated in favor of the new form approach
    // but kept for compatibility if used elsewhere
    this.openAddForm(dossierId);
  }

  uploadChequeFile(dossierId: number): void {
    // This method is now handled by submitNewChequeFile
    // but kept for compatibility
  }

  viewChequeFile(chequeFile: ChequeFile, download: boolean = false): void {
    if (!chequeFile.filePath) {
      alert('Aucun fichier trouvé pour ce chèque.');
      return;
    }

    if (!chequeFile.id) {
      alert('ID de fichier de chèque invalide.');
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.chequeFileService.downloadChequeFile(chequeFile.id, download)
      .subscribe({
        next: (blob) => {
          this.isLoading = false;
          const blobUrl = URL.createObjectURL(blob);
          if (download) {
            const a = document.createElement('a');
            a.href = blobUrl;
            // Add null check for filePath
            const fileName = chequeFile.filePath ? chequeFile.filePath.split('/').pop() : null;
            a.download = fileName ?? 'cheque.pdf';
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
          console.error('Erreur:', error);
          this.errorMessage = 'Impossible de charger le fichier.';
        }
      });
  }

  deleteChequeFile(chequeFile: ChequeFile): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce fichier de chèque ?')) return;

    if (!chequeFile.id) {
      this.errorMessage = 'ID de fichier de chèque invalide.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.chequeFileService.deleteChequeFileById(chequeFile.id).subscribe({
      next: () => {
        this.successMessage = 'Fichier de chèque supprimé avec succès.';
        
        // Remove the cheque file from the dossier more reliably
        if (chequeFile.dossierId) {
          const dossierIndex = this.dossiers.findIndex(d => d.id === chequeFile.dossierId);
          if (dossierIndex !== -1 && this.dossiers[dossierIndex].chequeFiles) {
            // Create a new array to trigger change detection
            const updatedDossier = { ...this.dossiers[dossierIndex] };
            updatedDossier.chequeFiles = updatedDossier.chequeFiles!.filter(cf => cf.id !== chequeFile.id);
            
            this.dossiers = [
              ...this.dossiers.slice(0, dossierIndex),
              updatedDossier,
              ...this.dossiers.slice(dossierIndex + 1)
            ];
          }
        }
        
        this.isLoading = false;
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur lors de la suppression du fichier de chèque', err);
        this.errorMessage = 'Erreur lors de la suppression du fichier de chèque.';
        this.isLoading = false;
      },
    });
  }
  
  addNewChequeFile(dossierId: number): void {
    this.openAddForm(dossierId);
  }

  // Add these methods to help Angular track changes
  trackByChequeFileId(index: number, chequeFile: ChequeFile): any {
    return chequeFile.id;
  }

  trackByDossierId(index: number, dossier: DossierRecouvrement): any {
    return dossier.id;
  }
}