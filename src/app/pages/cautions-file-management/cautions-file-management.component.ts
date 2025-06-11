import { Component, OnInit, Input, ChangeDetectorRef } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms"
import { HttpErrorResponse } from "@angular/common/http"
import { finalize } from "rxjs/operators"

import { DossierRecouvrement } from "src/app/shared/models/dossier-recouvrement.model"
import { DossierRecouvrementService } from "src/app/shared/services/dossier-recouvrement.service"
import { CautionFileService } from "src/app/shared/services/caution-file.service"
import { AuthService } from "src/app/auth/auth.service"
import { RoleService } from "src/app/shared/services/role.service"

// Interface for CautionFile
interface CautionFile {
  id: number;
  title: string;
  filePath: string | null;
  uploadDate: string | Date;
}

// Extended DossierRecouvrement interface - override cautionsFile property
interface ExtendedDossierRecouvrement extends Omit<DossierRecouvrement, 'cautionsFile'> {
  cautionsFile?: CautionFile[];
}

@Component({
  selector: "app-cautions-file-management",
  templateUrl: "./cautions-file-management.component.html",
  styleUrls: ["./cautions-file-management.component.css"],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
})
export class CautionsFileManagementComponent implements OnInit {
  @Input() dossierId: number | null = null;
  dossiers: ExtendedDossierRecouvrement[] = []
  isLoading = false
  errorMessage: string | null = null
  successMessage: string | null = null
  searchTerm = ""
  readonly newCautionFileForm: FormGroup
  editingCautionFile: CautionFile | null = null
  
  // New properties for the add form
  showAddForm = false;
  selectedFile: File | null = null;
  selectedFileName: string | null = null;
  currentDossierId: number | null = null;
  formSubmitted = false;

  constructor(
    private dossierService: DossierRecouvrementService,
    private cautionFileService: CautionFileService,
    public authService: AuthService,
    public roleService: RoleService,
    private readonly fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.newCautionFileForm = this.fb.group({
      title: ["", Validators.required]
    })
  }

  ngOnInit(): void {
    this.loadDossiers()
  }

  loadDossiers(): void {
    this.isLoading = true
    this.dossierService.getDossiers().subscribe({
      next: (data: DossierRecouvrement[]) => {
        // Transform the data to match ExtendedDossierRecouvrement
        this.dossiers = data.map(dossier => ({
          ...dossier,
          cautionsFile: []
        })) as ExtendedDossierRecouvrement[]
        
        // For each dossier, load its caution files separately
        if (this.dossierId) {
          // If we have a specific dossier ID, only load cautions for that dossier
          this.loadCautionFilesForDossier(this.dossierId);
        } else {
          // Otherwise load cautions for all dossiers
          this.dossiers.forEach(dossier => {
            this.loadCautionFilesForDossier(dossier.id);
          });
        }
        
        this.isLoading = false
      },
      error: (err: HttpErrorResponse) => {
        console.error("Erreur lors du chargement des dossiers", err)
        this.errorMessage = "Erreur lors du chargement des dossiers"
        this.isLoading = false
      },
    })
  }

  /**
   * Loads caution files for a specific dossier
   * @param dossierId The ID of the dossier to load caution files for
   */
  loadCautionFilesForDossier(dossierId: number): void {
    this.cautionFileService.getCautionFilesByDossierId(dossierId).subscribe({
      next: (cautionFiles: any[]) => {
        // Find the dossier in our array and update its cautionsFile property
        const dossierIndex = this.dossiers.findIndex(d => d.id === dossierId);
        if (dossierIndex !== -1) {
          // Create a new dossier object with updated cautionsFile to trigger change detection
          this.dossiers = [
            ...this.dossiers.slice(0, dossierIndex),
            {
              ...this.dossiers[dossierIndex],
              cautionsFile: cautionFiles
            },
            ...this.dossiers.slice(dossierIndex + 1)
          ];
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error(`Error loading caution files for dossier ${dossierId}`, err);
      }
    });
  }

  getFileNameFromUrl(url: string | null): string {
    if (!url) return "";
    const parts = url.split("/");
    return parts[parts.length - 1];
  }

  // Single implementation of getFileName method
  getFileName(filePath: string | null): string {
    if (!filePath) return "Aucun fichier"
    // Handle both forward and backslashes
    const parts = filePath.split(/[/\\]/)
    return parts[parts.length - 1] || "Aucun fichier"
  }

  getDossierById(dossierId: number): ExtendedDossierRecouvrement | undefined {
    return this.dossiers.find((dossier) => dossier.id === dossierId)
  }

  // New methods for the add form
  openAddForm(dossierId: number): void {
    this.currentDossierId = dossierId;
    this.showAddForm = true;
    this.newCautionFileForm.reset();
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
    this.newCautionFileForm.reset();
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
      
      // Auto-fill title with filename (without extension) if title is empty
      if (!this.newCautionFileForm.get('title')?.value) {
        const nameWithoutExtension = file.name.split('.').slice(0, -1).join('.');
        this.newCautionFileForm.patchValue({ title: nameWithoutExtension });
      }
    }
  }

  submitNewCautionFile(): void {
    this.formSubmitted = true;
    
    if (this.newCautionFileForm.invalid || !this.selectedFile || !this.currentDossierId) {
      if (!this.selectedFile) {
        this.errorMessage = 'Veuillez sélectionner un fichier.';
      }
      return;
    }

    const title = this.newCautionFileForm.get('title')?.value?.trim();
    if (!title) {
      this.errorMessage = 'Veuillez saisir un titre pour le fichier de caution.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.cautionFileService.uploadCautionFile(this.currentDossierId, title, this.selectedFile)
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
        next: (newCautionFile: CautionFile) => {
          this.successMessage = 'Fichier de caution ajouté avec succès.';
          
          // Update the dossier in our list
          const dossierIndex = this.dossiers.findIndex(d => d.id === this.currentDossierId);
          if (dossierIndex !== -1) {
            const updatedDossier = { ...this.dossiers[dossierIndex] };
            if (!updatedDossier.cautionsFile) {
              updatedDossier.cautionsFile = [];
            }
            updatedDossier.cautionsFile = [...updatedDossier.cautionsFile, newCautionFile];
            
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
          this.errorMessage = "Erreur lors de l'ajout du fichier de caution.";
        },
      });
  }

  // Keep the old method for backward compatibility (if needed elsewhere)
  onFileUpload(event: any, dossierId: number): void {
    // This method is now deprecated in favor of the new form approach
    // but kept for compatibility if used elsewhere
    this.openAddForm(dossierId);
  }

  viewCautionFile(cautionFile: CautionFile, download: boolean = false): void {
    if (!cautionFile.filePath) {
      alert('Aucun fichier trouvé pour cette caution.');
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.cautionFileService.downloadCautionFile(cautionFile.id, download)
      .subscribe({
        next: (blob: Blob) => {
          this.isLoading = false;
          const blobUrl = URL.createObjectURL(blob);
          if (download) {
            const a = document.createElement('a');
            a.href = blobUrl;
            // Add null check for filePath
            const fileName = cautionFile.filePath ? cautionFile.filePath.split('/').pop() : null;
            a.download = fileName ?? 'caution.pdf';
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

  startEdit(cautionFile: CautionFile): void {
    this.editingCautionFile = { ...cautionFile };
    this.errorMessage = null;
  }

  cancelEdit(): void {
    this.editingCautionFile = null;
  }

  updateCautionFile(): void {
    if (!this.editingCautionFile) return;

    const title = this.editingCautionFile.title?.trim();
    if (!title) {
      this.errorMessage = 'Le titre du fichier de caution est requis.';
      return;
    }

    this.isLoading = true;
    this.cautionFileService.updateCautionFile(this.editingCautionFile.id, this.editingCautionFile).subscribe({
      next: (updatedCautionFile) => {
        this.successMessage = 'Titre du fichier de caution mis à jour avec succès.';
        
        // Update the caution file in the dossier more reliably
        if (updatedCautionFile) {
          // Find the dossier that contains this caution file
          for (let i = 0; i < this.dossiers.length; i++) {
            const dossier = this.dossiers[i];
            if (dossier.cautionsFile) {
              const cautionIndex = dossier.cautionsFile.findIndex(c => c.id === updatedCautionFile.id);
              if (cautionIndex !== -1) {
                // Create a new dossier object with updated cautionsFile array
                const updatedDossier = { ...dossier };
                updatedDossier.cautionsFile = [
                  ...dossier.cautionsFile.slice(0, cautionIndex),
                  updatedCautionFile,
                  ...dossier.cautionsFile.slice(cautionIndex + 1)
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
        this.editingCautionFile = null;
        this.errorMessage = null;
        this.isLoading = false;
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = null;
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur lors de la mise à jour du titre', err);
        this.errorMessage = 'Erreur lors de la mise à jour du titre du fichier de caution.';
        this.isLoading = false;
      },
    });
  }

  deleteCautionFile(cautionFile: CautionFile): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce fichier de caution ?')) return;

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.cautionFileService.deleteCautionFileById(cautionFile.id).subscribe({
      next: () => {
        this.successMessage = 'Fichier de caution supprimé avec succès.';
        
        // Remove the caution file from the dossier more reliably
        // Find the dossier that contains this caution file
        for (let i = 0; i < this.dossiers.length; i++) {
          const dossier = this.dossiers[i];
          if (dossier.cautionsFile) {
            const cautionIndex = dossier.cautionsFile.findIndex(c => c.id === cautionFile.id);
            if (cautionIndex !== -1) {
              // Create a new dossier object with updated cautionsFile array
              const updatedDossier = { ...dossier };
              updatedDossier.cautionsFile = dossier.cautionsFile.filter(c => c.id !== cautionFile.id);
              
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
        console.error('Erreur lors de la suppression du fichier de caution', err);
        this.errorMessage = 'Erreur lors de la suppression du fichier de caution.';
        this.isLoading = false;
      },
    });
  }
  
  // Add these methods to help Angular track changes
  trackByCautionFileId(index: number, cautionFile: CautionFile): any {
    return cautionFile.id;
  }

  trackByDossierId(index: number, dossier: ExtendedDossierRecouvrement): any {
    return dossier.id;
  }
}