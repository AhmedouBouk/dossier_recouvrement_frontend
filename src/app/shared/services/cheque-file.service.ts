import { Injectable } from "@angular/core"
import  { HttpClient } from "@angular/common/http"
import  { Observable } from "rxjs"
import { environment } from "src/environments/environment"
import  { ChequeFile, ChequeFileUpdateDto } from "../models/cheque-file.model"

@Injectable({
  providedIn: "root",
})
export class ChequeFileService {
  private apiUrl = `${environment.apiUrl}/api/cheques`

  constructor(private readonly http: HttpClient) {}

  uploadChequeFile(
    dossierId: number,
    title: string,
    file: File,
    chequeNumber?: string,
    montant?: number,
    dateEcheance?: string,
  ): Observable<ChequeFile> {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("title", title)
    if (chequeNumber) {
      formData.append("chequeNumber", chequeNumber)
    }
    if (montant !== undefined && montant !== null) {
      formData.append("montant", montant.toString())
    }
    if (dateEcheance) {
      formData.append("dateEcheance", dateEcheance)
    }
    return this.http.post<ChequeFile>(`${this.apiUrl}/upload/${dossierId}`, formData)
  }

  getChequeFilesByDossierId(dossierId: number): Observable<ChequeFile[]> {
    return this.http.get<ChequeFile[]>(`${this.apiUrl}/dossier/${dossierId}`)
  }

  getChequeFileById(chequeFileId: number): Observable<ChequeFile> {
    return this.http.get<ChequeFile>(`${this.apiUrl}/${chequeFileId}`)
  }

  // Fixed: Accept ChequeFileUpdateDto object instead of individual parameters
  updateChequeFile(chequeFileId: number, updateDto: ChequeFileUpdateDto): Observable<ChequeFile> {
    return this.http.put<ChequeFile>(`${this.apiUrl}/${chequeFileId}`, updateDto)
  }

  deleteChequeFileById(chequeFileId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${chequeFileId}`)
  }

  deleteAllChequeFilesByDossierId(dossierId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/dossier/${dossierId}/all`)
  }

  downloadChequeFile(chequeFileId: number, download: boolean = false): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${chequeFileId}?download=${download}`, {
      responseType: "blob",
    })
  }

  // Helper method to construct full download URLs for a ChequeFile or its ID
  getChequeFileDownloadUrl(item: ChequeFile | number): string {
    const fileId = typeof item === "number" ? item : item.id
    if (fileId) {
      return `${this.apiUrl}/download/${fileId}`
    }
    console.warn("ChequeFile ID not available for generating download URL for item:", item)
    return ""
  }
}
