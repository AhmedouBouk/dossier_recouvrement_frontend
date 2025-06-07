import { Component, type OnInit } from "@angular/core"
import { DossierRecouvrement } from "src/app/shared/models/dossier-recouvrement.model"
import { ChequeFile } from "src/app/shared/models/cheque-file.model"
import { ChequeFileService } from "src/app/shared/services/cheque-file.service"
import { DossierRecouvrementService } from "src/app/shared/services/dossier-recouvrement.service"
import { AuthService } from "src/app/auth/auth.service"
import { HttpErrorResponse } from "@angular/common/http"
import { RoleService } from "src/app/shared/services/role.service"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"

@Component({
  selector: "app-cheque-file-management",
  templateUrl: "./cheque-file-management.component.html",
  styleUrls: ["./cheque-file-management.component.css"],
})
export class ChequeFileManagementComponent implements OnInit {
  dossiers: DossierRecouvrement[] = []
  isLoading = false
  errorMessage: string | null = null
  successMessage: string | null = null
  editingChequeFile: ChequeFile | null = null
  readonly newChequeFileForm: FormGroup
  readonly selectedFiles = new Map<number, File>()

  constructor(
    private chequeFileService: ChequeFileService,
    private dossierService: DossierRecouvrementService,
    public authService: AuthService,
    public roleService: RoleService,
    private readonly fb: FormBuilder,
  ) {
    this.newChequeFileForm = this.fb.group({
      title: ["", Validators.required],
      chequeNumber: [""],
      montant: [""],
      dateEcheance: [""],
    })
  }

  ngOnInit(): void {
    this.loadDossiers()
  }

  loadDossiers(): void {
    this.isLoading = true
    this.dossierService.getDossiers().subscribe({
      next: (data) => {
        this.dossiers = data
        this.isLoading = false
      },
      error: (err) => {
        console.error("Erreur lors du chargement des dossiers", err)
        this.errorMessage = "Erreur lors du chargement des dossiers"
        this.isLoading = false
      },
    })
  }

  getFileNameFromUrl(url: string | null): string {
    if (!url) return "Aucun fichier"
    return url.split("/").pop() || "Aucun fichier"
  }

  getFileName(filePath: string | null): string {
    if (!filePath) return "Aucun fichier"
    // Handle both forward and backslashes
    const parts = filePath.split(/[/\\]/)
    return parts[parts.length - 1] || "Aucun fichier"
  }

  getDossierById(dossierId: number): DossierRecouvrement | undefined {
    return this.dossiers.find((dossier) => dossier.id === dossierId)
  }

  startEdit(chequeFile: ChequeFile): void {
    this.editingChequeFile = { ...chequeFile }
    this.errorMessage = null
  }

  cancelEdit(): void {
    this.editingChequeFile = null
  }

  updateChequeFile(): void {
    if (!this.editingChequeFile) return

    const title = this.editingChequeFile.title?.trim()
    if (!title) {
      this.errorMessage = "Le titre du fichier de chèque est requis."
      return
    }

    // Check if ID exists
    if (!this.editingChequeFile.id) {
      this.errorMessage = "ID de fichier de chèque invalide."
      return
    }

    this.isLoading = true
    const updateDto = {
      title: title,
      chequeNumber: this.editingChequeFile.chequeNumber,
      montant: this.editingChequeFile.montant,
      dateEcheance: this.editingChequeFile.dateEcheance,
    }

    this.chequeFileService.updateChequeFile(this.editingChequeFile.id, updateDto).subscribe({
      next: (updatedChequeFile) => {
        this.successMessage = "Titre du fichier de chèque mis à jour avec succès."

        // Update the cheque file in the dossier
        if (updatedChequeFile && updatedChequeFile.dossierId) {
          const dossier = this.getDossierById(updatedChequeFile.dossierId)
          if (dossier && dossier.chequeFiles) {
            const chequeFileIndex = dossier.chequeFiles.findIndex((cf) => cf.id === updatedChequeFile.id)
            if (chequeFileIndex !== -1) {
              dossier.chequeFiles[chequeFileIndex] = updatedChequeFile
            }
          }
        }

        this.editingChequeFile = null
        this.errorMessage = null
        this.isLoading = false
      },
      error: (err: HttpErrorResponse) => {
        console.error("Erreur lors de la mise à jour du titre", err)
        this.errorMessage = "Erreur lors de la mise à jour du titre du fichier de chèque."
        this.isLoading = false
      },
    })
  }

  onFileUpload(event: any, dossierId: number): void {
    const file: File = event.target.files[0]
    if (!file) return

    // Store the file temporarily
    this.selectedFiles.set(dossierId, file)

    // Show the new cheque file form
    this.newChequeFileForm.patchValue({ title: file.name.split(".")[0] })

    // Upload immediately
    this.uploadChequeFile(dossierId)
  }

  uploadChequeFile(dossierId: number): void {
    const file = this.selectedFiles.get(dossierId)
    if (!file) {
      this.errorMessage = "Veuillez sélectionner un fichier."
      return
    }

    // Get form values
    const formValue = this.newChequeFileForm.value
    const title = formValue.title ?? file.name.split(".")[0]

    if (!title.trim()) {
      this.errorMessage = "Veuillez saisir un titre pour le fichier de chèque."
      return
    }

    this.isLoading = true
    this.errorMessage = null
    this.successMessage = null

    this.chequeFileService
      .uploadChequeFile(dossierId, title, file, formValue.chequeNumber, formValue.montant, formValue.dateEcheance)
      .subscribe({
        next: (newChequeFile) => {
          this.successMessage = "Fichier de chèque uploadé avec succès."

          // Update the dossier in our list
          const dossier = this.getDossierById(dossierId)
          if (dossier) {
            if (!dossier.chequeFiles) {
              dossier.chequeFiles = []
            }
            dossier.chequeFiles.push(newChequeFile)
          }

          // Clear the form and selected file
          this.newChequeFileForm.reset()
          this.selectedFiles.delete(dossierId)

          this.isLoading = false
        },
        error: (err: HttpErrorResponse) => {
          console.error("Erreur lors de l'upload", err)
          this.errorMessage = "Erreur lors de l'upload du fichier de chèque."
          this.isLoading = false
        },
      })
  }

  viewChequeFile(chequeFile: ChequeFile, download = false): void {
    if (!chequeFile.filePath) {
      alert("Aucun fichier trouvé pour ce chèque.")
      return
    }

    if (!chequeFile.id) {
      alert("ID de fichier de chèque invalide.")
      return
    }

    this.isLoading = true
    this.chequeFileService.downloadChequeFile(chequeFile.id).subscribe({
      next: (blob) => {
        this.isLoading = false
        const blobUrl = URL.createObjectURL(blob)
        if (download) {
          const a = document.createElement("a")
          a.href = blobUrl
          // Add null check for filePath
          const fileName = chequeFile.filePath ? chequeFile.filePath.split("/").pop() : null
          a.download = fileName ?? "cheque.pdf"
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(blobUrl)
        } else {
          window.open(blobUrl, "_blank")
        }
      },
      error: (error) => {
        this.isLoading = false
        console.error("Erreur:", error)
        this.errorMessage = "Impossible de charger le fichier."
      },
    })
  }

  deleteChequeFile(chequeFile: ChequeFile): void {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce fichier de chèque ?")) return

    if (!chequeFile.id) {
      this.errorMessage = "ID de fichier de chèque invalide."
      return
    }

    this.isLoading = true
    this.errorMessage = null
    this.successMessage = null

    this.chequeFileService.deleteChequeFileById(chequeFile.id).subscribe({
      next: () => {
        this.successMessage = "Fichier de chèque supprimé avec succès."

        // Remove the cheque file from the dossier
        if (chequeFile.dossierId) {
          const dossier = this.getDossierById(chequeFile.dossierId)
          if (dossier && dossier.chequeFiles) {
            dossier.chequeFiles = dossier.chequeFiles.filter((cf) => cf.id !== chequeFile.id)
          }
        }

        this.isLoading = false
      },
      error: (err: HttpErrorResponse) => {
        console.error("Erreur lors de la suppression du fichier de chèque", err)
        this.errorMessage = "Erreur lors de la suppression du fichier de chèque."
        this.isLoading = false
      },
    })
  }

  addNewChequeFile(dossierId: number): void {
    // Show form for adding a new cheque file
    this.newChequeFileForm.reset()
    // Logic for adding new cheque file will be implemented in the template
  }
}
