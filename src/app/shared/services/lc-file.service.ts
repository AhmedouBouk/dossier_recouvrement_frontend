// src/app/shared/services/lc-file.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

// Define the LcFile interface if not already defined elsewhere
interface LcFile {
  id?: number;
  title: string;
  lcNumber: string;
  montant: number;
  dateEcheance: Date;
  filePath?: string;
  uploadDate?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
}

@Injectable({
  providedIn: 'root',
})
export class LcFileService {
  private readonly apiUrl = `${environment.apiUrl}/lc`;

  constructor(private readonly http: HttpClient) {}

  // Upload a new LC file - simplified to only require title and file
  uploadLcFile(dossierId: number, title: string, file: File): Observable<LcFile> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    // Upload date will be set automatically by the backend to current date
    return this.http
      .post<LcFile>(`${environment.apiUrl}/lc/upload/${dossierId}`, formData)
      .pipe(catchError(this.handleError));
  }

  // Get all LC files for a specific dossier
  getLcFilesByDossierId(dossierId: number): Observable<LcFile[]> {
    return this.http
      .get<LcFile[]>(`${this.apiUrl}/dossier/${dossierId}`)
      .pipe(catchError(this.handleError));
  }

  // Get a specific LC file by ID
  getLcFileById(id: number): Observable<LcFile> {
    return this.http
      .get<LcFile>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Update an existing LC file's metadata
  updateLcFile(id: number, title: string, lcNumber?: string, montant?: number, dateEcheance?: Date): Observable<LcFile> {
    const formData = new FormData();
    formData.append('title', title);
    
    if (lcNumber) {
      formData.append('lcNumber', lcNumber);
    }
    
    if (montant !== undefined && montant !== null) {
      formData.append('montant', montant.toString());
    }
    
    if (dateEcheance) {
      formData.append('dateEcheance', dateEcheance.toISOString());
    }
    
    return this.http
      .put<LcFile>(`${this.apiUrl}/update/${id}`, formData)
      .pipe(catchError(this.handleError));
  }

  // Delete an LC file
  deleteLcFile(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/delete/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Download LC file content
  downloadLcFile(id: number): Observable<Blob> {
    return this.http
      .get(`${this.apiUrl}/download/${id}`, { responseType: 'blob' })
      .pipe(catchError(this.handleError));
  }

  // Get full file URL if needed
  getFullFileUrl(relativePath: string): string {
    // Check if the path is already a complete URL
    if (relativePath && !relativePath.startsWith('http')) {
      return `${environment.apiUrl}${relativePath}`;
    }
    return relativePath;
  }

  // Error handling
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred:', error);
    let errorMessage = 'An error occurred while managing LC files.';
    
    // Handle specific HTTP error codes
    if (error.status === 403) {
      errorMessage = "Vous n'avez pas la permission d'effectuer cette action.";
    } else if (error.status === 400) {
      errorMessage = error.error?.message ?? 'Données invalides. Veuillez vérifier vos entrées.';
    } else if (error.status === 404) {
      errorMessage = 'La ressource demandée est introuvable.';
    } else if (error.status === 500) {
      errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}