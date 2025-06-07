import { Component, OnInit } from "@angular/core"
import { DossierRecouvrement } from "src/app/shared/models/dossier-recouvrement.model"
import { LcFile } from "src/app/shared/models/lc-file.model"
import { LcFileService } from "src/app/shared/services/lc-file.service"
import { DossierRecouvrementService } from "src/app/shared/services/dossier-recouvrement.service"
import { AuthService } from "src/app/auth/auth.service"
import { HttpErrorResponse } from "@angular/common/http"
import { RoleService } from "src/app/shared/services/role.service"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { finalize } from "rxjs/operators"

@Component({
  selector: "app-lc-file-management",
  templateUrl: "./lc-file-management.component.html",
  styleUrls: ["./lc-file-management.component.css"],
})
export class LcFileManagementComponent implements OnInit {
  dossiers: DossierRecouvrement[] = []
  searchTerm = ""
  isLoading = false
  errorMessage: string | null = null
  successMessage: string | null = null
  editingLcFile: LcFile | null = null

  selectedDossierId: number | null = null
  selectedFile: File | null = null
  readonly newLcFileForm: FormGroup

  constructor(
    private lcFileService: LcFileService,
    private dossierService: DossierRecouvrementService,
    public authService: AuthService,
    public roleService: RoleService,
    private readonly fb: FormBuilder,
  ) {
    this.newLcFileForm = this.fb.group({
      title: ["", Validators.required]
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
        console.error('Error loading dossiers:', error)
        this.errorMessage = 'Erreur lors du chargement des dossiers.'
        this.isLoading = false
      }
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

  startEdit(lcFile: LcFile): void {
    this.editingLcFile = { ...lcFile }
    this.errorMessage = null
  }

  cancelEdit(): void {
    this.editingLcFile = null
  }

  updateLcFile(): void {
    if (!this.editingLcFile?.id) {
      this.errorMessage = 'Aucun fichier LC sélectionné pour modification.'
      return
    }

    this.isLoading = true
    this.errorMessage = null

    this.lcFileService
      .updateLcFile(
        this.editingLcFile.id,
        this.editingLcFile.title,
        this.editingLcFile.lcNumber ?? '',
        this.editingLcFile.montant ?? 0,
        new Date(this.editingLcFile.dateEcheance ?? new Date())
      )
      .subscribe({
        next: (updatedFile: any) => {
          this.successMessage = 'Fichier LC mis à jour avec succès.'

          // Update the file in the dossier
          const dossier = this.getDossierById(updatedFile.dossierId)
          if (dossier && dossier.lcFiles) {
            const index = dossier.lcFiles.findIndex(f => f.id === updatedFile.id)
            if (index !== -1) {
              dossier.lcFiles[index] = updatedFile as LcFile
            }
          }

          this.cancelEdit()
          this.isLoading = false
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error updating LC file:', error)
          this.errorMessage = 'Erreur lors de la mise à jour du fichier LC.'
          this.isLoading = false
        }
      })
  }

  onFileUpload(event: any, dossierId: number): void {
    const file = event.target.files[0]
    if (file) {
      if (!this.roleService.hasUploadLcFilePermission()) {
        this.errorMessage = "Vous n'avez pas la permission d'uploader des fichiers LC."
        event.target.value = null
        return
      }
      // Check file size (limit to 1MB to match Spring Boot's default)
      const maxSizeInBytes = 1 * 1024 * 1024; // 1MB in bytes
      if (file.size > maxSizeInBytes) {
        this.errorMessage = "Le fichier est trop volumineux. La taille maximale autorisée est de 1 Mo."
        event.target.value = null
        return
      }
      this.selectedFile = file
      this.selectedDossierId = dossierId
      this.newLcFileForm.patchValue({ title: file.name.split('.')[0] })
      this.uploadLcFile()
    }
  }

  uploadLcFile(): void {
    // Check permissions first
    if (!this.roleService.hasUploadLcFilePermission()) {
      this.errorMessage = "Vous n'avez pas la permission d'uploader des fichiers LC."
      return
    }

    if (!this.selectedFile) {
      this.errorMessage = 'Veuillez sélectionner un fichier.'
      return
    }
    
    if (!this.selectedDossierId) {
      this.errorMessage = 'Aucun dossier sélectionné pour l\'upload.'
      return
    }

    if (!this.newLcFileForm.valid) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.'
      return
    }

    const title = this.newLcFileForm.get('title')?.value ?? this.selectedFile.name.split('.')[0]

    this.isLoading = true
    this.errorMessage = null
    this.successMessage = null

    // Ensure dossierId is a valid number before sending
    const dossierId = Number(this.selectedDossierId)
    if (isNaN(dossierId) || dossierId <= 0) {
      this.errorMessage = 'ID de dossier invalide.'
      this.isLoading = false
      return
    }
    
    // Only send title and file as per simplified form
    this.lcFileService
      .uploadLcFile(
        dossierId,
        title,
        this.selectedFile
      )
      .subscribe({
        next: (updatedLcFile: any) => {
          this.successMessage = 'Fichier LC uploadé avec succès.'

          // Reload dossiers to ensure we have the latest data
          this.loadDossiers()
          
          // Reset form and selected file
          this.newLcFileForm.reset()
          this.selectedFile = null
          this.selectedDossierId = null
          this.isLoading = false
        },
        error: (err: HttpErrorResponse) => {
          console.error('Erreur lors de l\'upload', err)
          this.errorMessage = 'Erreur lors de l\'upload du fichier LC: ' + (err.error?.message ?? err.message ?? 'Erreur inconnue')
          this.isLoading = false
        }
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
    this.lcFileService.downloadLcFile(lcFile.id).subscribe({
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
      this.errorMessage = 'Aucun fichier LC sélectionné pour suppression.'
      return
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer ce fichier LC?')) {
      return
    }

    this.isLoading = true
    this.errorMessage = null

    this.lcFileService.deleteLcFile(lcFile.id).subscribe({
      next: () => {
        this.successMessage = 'Fichier LC supprimé avec succès.'

        // Remove the file from the dossier
        const dossier = this.getDossierById(lcFile.dossierId)
        if (dossier && dossier.lcFiles) {
          dossier.lcFiles = dossier.lcFiles.filter(f => f.id !== lcFile.id)
        }

        this.isLoading = false
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error deleting LC file:', error)
        this.errorMessage = 'Erreur lors de la suppression du fichier LC.'
        this.isLoading = false
      }
    })
  }

  getFileName(filePath: string | null): string {
    if (!filePath) return "Aucun fichier"
    const parts = filePath.split(/[/\\]/)
    return parts[parts.length - 1] || "Aucun fichier"
  }
}
