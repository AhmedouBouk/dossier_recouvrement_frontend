// src/app/shared/services/cautions-file.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CautionFile, CautionFileUpdateDto } from '../models/caution-file.model';

@Injectable({
  providedIn: 'root',
})
export class CautionsFileService {
  private apiUrl = `${environment.apiUrl}/api/caution-files`;

  constructor(private readonly http: HttpClient) {}

  uploadCautionsFile(
    dossierId: number,
    title: string,
    file: File,
    cautionNumber?: string,
    montant?: number,
    dateEcheance?: string,
  ): Observable<CautionFile> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    if (cautionNumber) {
      formData.append('cautionNumber', cautionNumber);
    }
    if (montant !== undefined && montant !== null) {
      formData.append('montant', montant.toString());
    }
    if (dateEcheance) {
      formData.append('dateEcheance', dateEcheance);
    }
    return this.http.post<CautionFile>(`${this.apiUrl}/upload/${dossierId}`, formData);
  }

  getCautionsFilesByDossierId(dossierId: number): Observable<CautionFile[]> {
    return this.http.get<CautionFile[]>(`${this.apiUrl}/dossier/${dossierId}`);
  }

  getCautionsFileById(cautionFileId: number): Observable<CautionFile> {
    return this.http.get<CautionFile>(`${this.apiUrl}/${cautionFileId}`);
  }

  updateCautionsFile(cautionFileId: number, updateDto: CautionFileUpdateDto): Observable<CautionFile> {
    return this.http.put<CautionFile>(`${this.apiUrl}/${cautionFileId}`, updateDto);
  }

  deleteCautionsFileById(cautionFileId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${cautionFileId}`);
  }

  deleteAllCautionsFilesByDossierId(dossierId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/dossier/${dossierId}/all`);
  }

  downloadCautionsFile(cautionFileId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${cautionFileId}`, {
      responseType: 'blob',
    });
  }

  // Helper method to construct full download URLs for a CautionFile or its ID
  getCautionsFileDownloadUrl(item: CautionFile | number): string {
    const fileId = typeof item === 'number' ? item : item.id;
    if (fileId) {
      return `${this.apiUrl}/download/${fileId}`;
    }
    console.warn('CautionFile ID not available for generating download URL for item:', item);
    return '';
  }

  downloadPdfByDossier(id: number): Observable<Blob> {
    return this.http.get(`/api/credits/pdf/${id}`, { responseType: 'blob' });
  }

  getFullFileUrl(relativePath: string): string {
    // Si le chemin est déjà une URL complète, la retourner
    if (relativePath.startsWith('http')) {
      return relativePath;
    }
    // Sinon, construire l'URL complète
    const baseUrl = environment.apiUrl;
    return baseUrl + relativePath;
  }
}