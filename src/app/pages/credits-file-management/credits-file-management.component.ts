// src/app/pages/credits-file-management/credits-file-management.component.ts
import { Component, OnInit, Input } from '@angular/core';
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
  readonly selectedFiles = new Map<number, File>();
  isUploading = false;
  editingCreditFile: CreditFile | null = null;

  constructor(
    private dossierService: DossierRecouvrementService,
    private creditsFileService: CreditsFileService,
    public authService: AuthService,
    public roleService: RoleService,
    private readonly fb: FormBuilder,
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
          this.dossiers[dossierIndex].creditsFile = creditFiles;
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

  onFileUpload(event: Event, dossierId: number): void {
    const target = event.target as HTMLInputElement;
    const file: File | null = target.files?.[0] || null;
    if (!file) return;

    // Store the file temporarily
    this.selectedFiles.set(dossierId, file);

    // Show the new credit file form
    this.newCreditFileForm.patchValue({ title: file.name.split('.')[0] });

    // Upload immediately
    this.uploadCreditFile(dossierId);
  }

  uploadCreditFile(dossierId: number): void {
    const file = this.selectedFiles.get(dossierId);
    if (!file) {
      this.errorMessage = 'Veuillez sélectionner un fichier.';
      return;
    }

    if (!this.newCreditFileForm.valid) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    const title = this.newCreditFileForm.get('title')?.value || '';
    const creditNumber = this.newCreditFileForm.get('creditNumber')?.value || '';
    const montantStr = this.newCreditFileForm.get('montant')?.value;
    const montant = montantStr ? parseFloat(montantStr) : undefined;
    const dateEcheanceStr = this.newCreditFileForm.get('dateEcheance')?.value;
    const dateEcheance = dateEcheanceStr ? new Date(dateEcheanceStr) : undefined;

    this.isUploading = true;
    
    // Call the service with the correct parameters based on the service signature
    // Using FormData for file upload which is a common approach in Angular
    this.creditsFileService.uploadCreditFile(
      dossierId, 
      title, 
      file, 
      creditNumber || undefined, 
      montant || undefined, 
      dateEcheance || undefined
    ).pipe(
      finalize(() => {
        this.isUploading = false;
      })
    ).subscribe({
      next: (response: CreditFile) => {
        this.successMessage = 'Fichier de crédit téléversé avec succès.';
        this.loadDossiers();
        this.newCreditFileForm.reset();
        this.selectedFiles.delete(dossierId);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur lors du téléversement du fichier de crédit', err);
        this.errorMessage = `Erreur lors du téléversement : ${err.error?.message || err.message}`;
      },
    });
  }

  // Updated method to handle CreditFile objects
  viewCreditFile(creditFile: CreditFile, download = false): void {
    if (!creditFile.filePath) {
      alert('Aucun fichier trouvé pour ce crédit.');
      return;
    }

    this.creditsFileService.downloadCreditFile(creditFile.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        if (download) {
          // Extract filename from path or use a generic name
          const fileName = this.getFileName(creditFile.filePath) || `credit_${creditFile.id}.pdf`;
          link.download = fileName;
          link.click();
        } else {
          window.open(url, '_blank');
        }
        window.URL.revokeObjectURL(url);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur lors de la récupération du fichier', err);
        alert('Erreur lors de la récupération du fichier');
      },
    });
  }

  // Updated method to handle CreditFile objects
  deleteCreditFile(creditFile: CreditFile): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce fichier de crédit ?')) return;

    this.creditsFileService.deleteCreditFileById(creditFile.id).subscribe({
      next: () => {
        this.successMessage = 'Fichier de crédit supprimé avec succès.';
        this.loadDossiers();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur lors de la suppression du fichier', err);
        this.errorMessage = 'Erreur lors de la suppression du fichier.';
      },
    });
  }

  // Methods for editing credit file details
  startEdit(creditFile: CreditFile): void {
    this.editingCreditFile = { ...creditFile };
  }

  cancelEdit(): void {
    this.editingCreditFile = null;
  }

  updateCreditFile(): void {
    if (!this.editingCreditFile) return;

    this.creditsFileService.updateCreditFile(this.editingCreditFile.id, this.editingCreditFile).subscribe({
      next: () => {
        this.successMessage = 'Fichier de crédit mis à jour avec succès.';
        this.editingCreditFile = null;
        this.loadDossiers();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur lors de la mise à jour du fichier', err);
        this.errorMessage = 'Erreur lors de la mise à jour du fichier.';
      },
    });
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    // Filter dossiers based on search term if needed
  }
}