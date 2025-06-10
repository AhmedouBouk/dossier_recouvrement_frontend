import { Component, OnInit, ChangeDetectorRef } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms"
import { HttpErrorResponse } from "@angular/common/http"
import { finalize } from "rxjs/operators"

import { DossierRecouvrement } from "src/app/shared/models/dossier-recouvrement.model"
import { LcFile } from "src/app/shared/models/lc-file.model"
import { LcFileService } from "src/app/shared/services/lc-file.service"
import { DossierRecouvrementService } from "src/app/shared/services/dossier-recouvrement.service"
import { AuthService } from "src/app/auth/auth.service"
import { RoleService } from "src/app/shared/services/role.service"

@Component({
  selector: "app-lc-file-management",
  templateUrl: "./lc-file-management.component.html",
  styleUrls: ["./lc-file-management.component.css"],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
})
export class LcFileManagementComponent implements OnInit {
  dossiers: DossierRecouvrement[] = []
  searchTerm = ""
  isLoading = false
  errorMessage: string | null = null
  successMessage: string | null = null
  editingLcFile: LcFile | null = null

  // New properties for the modal form
  showAddForm = false
  selectedFile: File | null = null
  selectedFileName: string | null = null
  currentDossierId: number | null = null
  formSubmitted = false
  readonly newLcFileForm: FormGroup

  constructor(
    private readonly lcFileService: LcFileService,
    private readonly dossierService: DossierRecouvrementService,
    public authService: AuthService,
    public roleService: RoleService,
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.newLcFileForm = this.fb.group({
      title: ["", Validators.required],
    })
  }

  ngOnInit(): void {
    this.loadDossiers()
  }

  loadDossiers(): void {
    this.isLoading = true
    this.errorMessage = null

    this.dossierService.getDossiers().subscribe({
      next: (dossiers: DossierRecouvrement[]) => {
        this.dossiers = dossiers
        this.isLoading = false
      },
      error: (error: HttpErrorResponse) => {
        console.error("Error loading dossiers:", error)
        this.errorMessage = "Erreur lors du chargement des dossiers."
        this.isLoading = false
      },
    })
  }

  get filteredDossiers(): DossierRecouvrement[] {
    if (!this.searchTerm) {
      return this.dossiers
    }
    return this.dossiers.filter(
      (dossier) =>
        dossier.id?.toString().includes(this.searchTerm) ||
        dossier.nomClientRecouvrement?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        dossier.compte?.nomCompte?.toLowerCase().includes(this.searchTerm.toLowerCase()),
    )
  }

  getDossierById(dossierId: number): DossierRecouvrement | undefined {
    return this.dossiers.find((dossier) => dossier.id === dossierId)
  }

  // New methods for the modal form
  openAddForm(dossierId: number): void {
    this.currentDossierId = dossierId
    this.showAddForm = true
    this.newLcFileForm.reset()
    this.selectedFile = null
    this.selectedFileName = null
    this.formSubmitted = false
    this.errorMessage = null
    this.successMessage = null
  }

  closeAddForm(): void {
    this.showAddForm = false
    this.currentDossierId = null
    this.selectedFile = null
    this.selectedFileName = null
    this.formSubmitted = false
    this.newLcFileForm.reset()
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0]
    if (file) {
      // Check file size (limit to 1MB to match Spring Boot's default)
      const maxSizeInBytes = 1 * 1024 * 1024 // 1MB in bytes
      if (file.size > maxSizeInBytes) {
        this.errorMessage = "Le fichier est trop volumineux. La taille maximale autorisée est de 1 Mo."
        event.target.value = null
        return
      }

      this.selectedFile = file
      this.selectedFileName = file.name

      // Auto-fill title with filename (without extension) if title is empty
      if (!this.newLcFileForm.get("title")?.value) {
        const nameWithoutExtension = file.name.split(".").slice(0, -1).join(".")
        this.newLcFileForm.patchValue({ title: nameWithoutExtension })
      }
    }
  }

  submitNewLcFile(): void {
    this.formSubmitted = true

    if (this.newLcFileForm.invalid || !this.selectedFile || !this.currentDossierId) {
      if (!this.selectedFile) {
        this.errorMessage = "Veuillez sélectionner un fichier."
      }
      return
    }

    // Check permissions first
    if (!this.roleService.hasUploadLcFilePermission()) {
      this.errorMessage = "Vous n'avez pas la permission d'uploader des fichiers LC."
      return
    }

    const formValue = this.newLcFileForm.value
    const title = formValue.title?.trim()
    if (!title) {
      this.errorMessage = "Veuillez saisir un titre pour le fichier LC."
      return
    }

    this.isLoading = true
    this.errorMessage = null
    this.successMessage = null

    // Ensure dossierId is a valid number before sending
    const dossierId = Number(this.currentDossierId)
    if (isNaN(dossierId) || dossierId <= 0) {
      this.errorMessage = "ID de dossier invalide."
      this.isLoading = false
      return
    }

    // Only send title and file
    this.lcFileService
      .uploadLcFile(dossierId, title, this.selectedFile)
      .pipe(
        finalize(() => {
          this.isLoading = false
        }),
      )
      .subscribe({
        next: (newLcFile: any) => {
          this.successMessage = "Fichier LC ajouté avec succès."

          // Update the dossier in our list
          const dossierIndex = this.dossiers.findIndex((d) => d.id === dossierId)
          if (dossierIndex !== -1) {
            const updatedDossier = { ...this.dossiers[dossierIndex] }
            if (!updatedDossier.lcFiles) {
              updatedDossier.lcFiles = []
            }
            updatedDossier.lcFiles = [...updatedDossier.lcFiles, newLcFile]

            // Create a new array to trigger change detection
            this.dossiers = [
              ...this.dossiers.slice(0, dossierIndex),
              updatedDossier,
              ...this.dossiers.slice(dossierIndex + 1),
            ]
          }

          // Close the form
          this.closeAddForm()

          // Clear success message after 3 seconds
          setTimeout(() => {
            this.successMessage = null
            this.cdr.detectChanges()
          }, 3000)
        },
        error: (err: HttpErrorResponse) => {
          console.error("Erreur lors de l'upload", err)
          this.errorMessage =
            "Erreur lors de l'upload du fichier LC: " + (err.error?.message ?? err.message ?? "Erreur inconnue")
        },
      })
  }

  // Keep the old method for backward compatibility but modify it to use the new modal approach
  onFileUpload(event: any, dossierId: number): void {
    // Instead of processing the file directly, open the modal form
    this.openAddForm(dossierId)
  }

  startEdit(lcFile: LcFile): void {
    this.editingLcFile = { ...lcFile }
    this.errorMessage = null
  }

  cancelEdit(): void {
    this.editingLcFile = null
  }

  updateLcFile(): void {
    if (!this.editingLcFile?.id) {
      this.errorMessage = "Aucun fichier LC sélectionné pour modification."
      return
    }

    const title = this.editingLcFile.title?.trim()
    if (!title) {
      this.errorMessage = "Le titre du fichier LC est requis."
      return
    }

    this.isLoading = true
    this.errorMessage = null

    // Only update the title
    this.lcFileService.updateLcFile(this.editingLcFile.id, this.editingLcFile.title).subscribe({
      next: (updatedFile: any) => {
        this.successMessage = "Fichier LC mis à jour avec succès."

        // Update the file in the dossier using immutable approach
        const dossierIndex = this.dossiers.findIndex((d) => d.id === updatedFile.dossierId)
        if (dossierIndex !== -1) {
          const dossier = this.dossiers[dossierIndex]
          if (dossier.lcFiles && dossier.lcFiles.length > 0) {
            // Create a safe copy of lcFiles
            const lcFiles = [...dossier.lcFiles]
            const fileIndex = lcFiles.findIndex((f) => f.id === updatedFile.id)

            if (fileIndex !== -1) {
              lcFiles[fileIndex] = updatedFile as LcFile

              // Create a new dossier object with updated lcFiles
              const updatedDossier = {
                ...this.dossiers[dossierIndex],
                lcFiles,
              }

              // Update the dossiers array immutably
              this.dossiers = [
                ...this.dossiers.slice(0, dossierIndex),
                updatedDossier,
                ...this.dossiers.slice(dossierIndex + 1),
              ]
            }
          }
        }

        this.cancelEdit()
        this.isLoading = false

        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = null
          this.cdr.detectChanges()
        }, 3000)
      },
      error: (error: HttpErrorResponse) => {
        console.error("Error updating LC file:", error)
        this.errorMessage = "Erreur lors de la mise à jour du fichier LC."
        this.isLoading = false
      },
    })
  }

  viewLcFile(lcFile: LcFile, download = false): void {
    if (!lcFile.filePath) {
      alert("Aucun fichier trouvé pour ce fichier LC.")
      return
    }

    if (!lcFile.id) {
      alert("ID du fichier LC invalide.")
      return
    }

    this.isLoading = true
    this.errorMessage = null
    this.lcFileService.downloadLcFile(lcFile.id, download).subscribe({
      next: (blob: Blob) => {
        this.isLoading = false
        const blobUrl = URL.createObjectURL(blob)
        if (download) {
          const a = document.createElement("a")
          a.href = blobUrl
          const fileName = lcFile.filePath ? lcFile.filePath.split("/").pop() : null
          a.download = fileName ?? "lc-file.pdf"
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(blobUrl)
        } else {
          window.open(blobUrl, "_blank")
        }
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false
        console.error("Erreur:", error)
        this.errorMessage = "Impossible de charger le fichier."
      },
    })
  }

  deleteLcFile(lcFile: LcFile): void {
    if (!lcFile || !lcFile.id) {
      this.errorMessage = "Aucun fichier LC sélectionné pour suppression."
      return
    }

    if (!confirm("Êtes-vous sûr de vouloir supprimer ce fichier LC?")) {
      return
    }

    this.isLoading = true
    this.errorMessage = null

    this.lcFileService.deleteLcFile(lcFile.id).subscribe({
      next: () => {
        this.successMessage = "Fichier LC supprimé avec succès."

        // Remove the file from the dossier using immutable approach
        const dossierIndex = this.dossiers.findIndex((d) => d.id === lcFile.dossierId)
        if (dossierIndex !== -1 && this.dossiers[dossierIndex].lcFiles) {
          // Create a new dossier object with filtered lcFiles
          const updatedDossier = {
            ...this.dossiers[dossierIndex],
            lcFiles: this.dossiers[dossierIndex].lcFiles?.filter((f) => f.id !== lcFile.id) || [],
          }

          // Update the dossiers array immutably
          this.dossiers = [
            ...this.dossiers.slice(0, dossierIndex),
            updatedDossier,
            ...this.dossiers.slice(dossierIndex + 1),
          ]
        }

        this.isLoading = false

        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = null
          this.cdr.detectChanges()
        }, 3000)
      },
      error: (error: HttpErrorResponse) => {
        console.error("Error deleting LC file:", error)
        this.errorMessage = "Erreur lors de la suppression du fichier LC."
        this.isLoading = false
      },
    })
  }

  getFileName(filePath: string | null): string {
    if (!filePath) return "Aucun fichier"
    const parts = filePath.split(/[/\\]/)
    return parts[parts.length - 1] || "Aucun fichier"
  }

  // Add these methods to help Angular track changes
  trackByLcFileId(index: number, lcFile: LcFile): any {
    return lcFile.id
  }

  trackByDossierId(index: number, dossier: DossierRecouvrement): any {
    return dossier.id
  }
}
