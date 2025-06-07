import { Component, OnInit, Input } from "@angular/core"
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
  readonly selectedFiles = new Map<number, File>()
  isUploading = false
  editingCautionFile: CautionFile | null = null

  constructor(
    private dossierService: DossierRecouvrementService,
    private cautionFileService: CautionFileService,
    public authService: AuthService,
    public roleService: RoleService,
    private readonly fb: FormBuilder,
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
          this.dossiers[dossierIndex].cautionsFile = cautionFiles;
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

  onFileUpload(event: Event, dossierId: number): void {
    const target = event.target as HTMLInputElement
    const file: File | null = target.files?.[0] || null
    if (!file) return

    // Store the file temporarily
    this.selectedFiles.set(dossierId, file)

    // Show the new caution file form
    this.newCautionFileForm.patchValue({ title: file.name.split(".")[0] })

    // Upload immediately
    this.uploadCautionFile(dossierId)
  }

  uploadCautionFile(dossierId: number): void {
    const file = this.selectedFiles.get(dossierId)
    if (!file) {
      this.errorMessage = "Veuillez sélectionner un fichier."
      return
    }

    if (!this.newCautionFileForm.valid) {
      this.errorMessage = "Veuillez remplir tous les champs obligatoires."
      return
    }

    const title = this.newCautionFileForm.get('title')?.value || ""

    this.isUploading = true
    
    // Call the service with the correct parameters based on the service signature
    // Using FormData for file upload which is a common approach in Angular
    this.cautionFileService.uploadCautionFile(dossierId, title, file).pipe(
      finalize(() => {
        this.isUploading = false
      })
    ).subscribe({
      next: (response: CautionFile) => {
        this.successMessage = "Fichier de caution téléversé avec succès."
        this.loadDossiers()
        this.newCautionFileForm.reset()
        this.selectedFiles.delete(dossierId)
      },
      error: (err: HttpErrorResponse) => {
        console.error("Erreur lors du téléversement du fichier de caution", err)
        this.errorMessage = `Erreur lors du téléversement : ${err.error?.message || err.message}`
      },
    })
  }

  // Updated method to handle CautionFile objects
  viewCautionFile(cautionFile: CautionFile, download = false): void {
    if (!cautionFile.filePath) {
      alert("Aucun fichier trouvé pour cette caution.")
      return
    }

    this.cautionFileService.downloadCautionFile(cautionFile.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        if (download) {
          // Extract filename from path or use a generic name
          const fileName = this.getFileName(cautionFile.filePath) || `caution_${cautionFile.id}.pdf`
          link.download = fileName
          link.click()
        } else {
          window.open(url, "_blank")
        }
        window.URL.revokeObjectURL(url)
      },
      error: (err: HttpErrorResponse) => {
        console.error("Erreur lors de la récupération du fichier", err)
        alert("Erreur lors de la récupération du fichier")
      },
    })
  }

  // Updated method to handle CautionFile objects
  deleteCautionFile(cautionFile: CautionFile): void {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce fichier de caution ?")) return

    this.cautionFileService.deleteCautionFileById(cautionFile.id).subscribe({
      next: () => {
        this.successMessage = "Fichier de caution supprimé avec succès."
        this.loadDossiers()
      },
      error: (err: HttpErrorResponse) => {
        console.error("Erreur lors de la suppression du fichier", err)
        this.errorMessage = "Erreur lors de la suppression du fichier."
      },
    })
  }

  // Methods for editing caution file titles
  startEdit(cautionFile: CautionFile): void {
    this.editingCautionFile = { ...cautionFile }
  }

  cancelEdit(): void {
    this.editingCautionFile = null
  }

  updateCautionFile(): void {
    if (!this.editingCautionFile) return

    this.cautionFileService.updateCautionFile(this.editingCautionFile.id, this.editingCautionFile).subscribe({
      next: () => {
        this.successMessage = "Fichier de caution mis à jour avec succès."
        this.editingCautionFile = null
        this.loadDossiers()
      },
      error: (err: HttpErrorResponse) => {
        console.error("Erreur lors de la mise à jour du fichier", err)
        this.errorMessage = "Erreur lors de la mise à jour du fichier."
      },
    })
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement
    this.searchTerm = target.value
    // Filter dossiers based on search term if needed
  }
}