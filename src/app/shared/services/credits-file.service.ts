// src/app/shared/services/credits-file.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CreditFile, CreditFileUpdateDto } from '../models/credit-file.model';

@Injectable({
  providedIn: 'root',
})
export class CreditsFileService {
  private apiUrl = `${environment.apiUrl}/credits`;

  constructor(private http: HttpClient) {}

  // Legacy methods - keep for backward compatibility
  uploadCreditsFile(dossierId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/${dossierId}/upload`, formData);
  }

  deleteCreditsFile(dossierId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${dossierId}/delete`);
  }

  getFullFileUrl(relativePath: string): string {
    // Vérifie si le chemin est déjà une URL complète
    if (relativePath && !relativePath.startsWith('http')) {
      return `${environment.apiUrl}${relativePath}`;
    }
    return relativePath;
  }
  
  downloadPdfByDossier(id: number): Observable<Blob> {
    return this.http.get(`/api/credits/pdf/${id}`, { responseType: 'blob' });
  }
  
  // New methods for credit file management
  
  /**
   * Upload a credit file for a specific dossier
   * @param dossierId The ID of the dossier
   * @param title The title of the credit file
   * @param file The file to upload
   * @param creditNumber Optional credit number
   * @param montant Optional amount
   * @param dateEcheance Optional due date
   */
  uploadCreditFile(
    dossierId: number, 
    title: string, 
    file: File, 
    creditNumber?: string, 
    montant?: number, 
    dateEcheance?: Date
  ): Observable<CreditFile> {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);
    
    if (creditNumber) {
      formData.append('creditNumber', creditNumber);
    }
    
    if (montant) {
      formData.append('montant', montant.toString());
    }
    
    if (dateEcheance) {
      formData.append('dateEcheance', dateEcheance.toISOString());
    }
    
    return this.http.post<CreditFile>(`${this.apiUrl}/upload/${dossierId}`, formData);
  }

  /**
   * Get credit files by dossier ID
   * @param dossierId The ID of the dossier
   */
  getCreditFilesByDossierId(dossierId: number): Observable<CreditFile[]> {
    return this.http.get<CreditFile[]>(`${this.apiUrl}/dossier/${dossierId}`);
  }

  /**
   * Get a credit file by ID
   * @param id The ID of the credit file
   */
  getCreditFileById(id: number): Observable<CreditFile> {
    return this.http.get<CreditFile>(`${this.apiUrl}/${id}`);
  }

  /**
   * Update a credit file
   * @param id The ID of the credit file
   * @param creditFile The credit file data to update
   */
  updateCreditFile(id: number, creditFile: CreditFileUpdateDto): Observable<CreditFile> {
    const formData = new FormData();
    formData.append('title', creditFile.title);
    
    if (creditFile.creditNumber) {
      formData.append('creditNumber', creditFile.creditNumber);
    }
    
    if (creditFile.montant) {
      formData.append('montant', creditFile.montant.toString());
    }
    
    if (creditFile.dateEcheance) {
      const dateEcheance = typeof creditFile.dateEcheance === 'string' 
        ? creditFile.dateEcheance 
        : (creditFile.dateEcheance as Date).toISOString();
      formData.append('dateEcheance', dateEcheance);
    }
    
    return this.http.put<CreditFile>(`${this.apiUrl}/${id}`, formData);
  }

  /**
   * Delete a credit file by ID
   * @param id The ID of the credit file
   */
  deleteCreditFileById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Download a credit file
   * @param id The ID of the credit file
   */
  downloadCreditFile(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${id}`, {
      responseType: 'blob'
    });
  }

}