import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable } from "rxjs"
import { environment } from "src/environments/environment"
import { CautionFile, CautionFileUpdateDto } from "../models/caution-file.model"

@Injectable({
  providedIn: "root",
})
export class CautionFileService {
  private apiUrl = `${environment.apiUrl}/api/caution-files`

  constructor(private readonly http: HttpClient) {}

  uploadCautionFile(
    dossierId: number,
    title: string,
    file: File,
    cautionNumber?: string,
    montant?: number,
    dateEcheance?: string,
  ): Observable<CautionFile> {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("title", title)
    if (cautionNumber) {
      formData.append("cautionNumber", cautionNumber)
    }
    if (montant !== undefined && montant !== null) {
      formData.append("montant", montant.toString())
    }
    if (dateEcheance) {
      formData.append("dateEcheance", dateEcheance)
    }
    return this.http.post<CautionFile>(`${this.apiUrl}/upload/${dossierId}`, formData)
  }

  getCautionFilesByDossierId(dossierId: number): Observable<CautionFile[]> {
    return this.http.get<CautionFile[]>(`${this.apiUrl}/dossier/${dossierId}`)
  }

  getCautionFileById(cautionFileId: number): Observable<CautionFile> {
    return this.http.get<CautionFile>(`${this.apiUrl}/${cautionFileId}`)
  }

  updateCautionFile(cautionFileId: number, updateDto: any): Observable<CautionFile> {
    // Create a new object with only the fields that the backend DTO expects
    const cleanDto = {
      title: updateDto.title,
      cautionNumber: updateDto.cautionNumber,
      montant: updateDto.montant,
      dateEcheance: updateDto.dateEcheance
    };
    return this.http.put<CautionFile>(`${this.apiUrl}/${cautionFileId}`, cleanDto);
  }

  deleteCautionFileById(cautionFileId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${cautionFileId}`)
  }

  deleteAllCautionFilesByDossierId(dossierId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/dossier/${dossierId}/all`)
  }

  downloadCautionFile(cautionFileId: number, download: boolean = false): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${cautionFileId}?download=${download}`, {
      responseType: "blob",
    })
  }

  // Helper method to construct full download URLs for a CautionFile or its ID
  getCautionFileDownloadUrl(item: CautionFile | number): string {
    const fileId = typeof item === "number" ? item : item.id
    if (fileId) {
      return `${this.apiUrl}/download/${fileId}`
    }
    console.warn("CautionFile ID not available for generating download URL for item:", item)
    return ""
  }
}
