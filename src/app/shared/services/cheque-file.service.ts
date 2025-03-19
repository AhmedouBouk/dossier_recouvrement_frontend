// src/app/shared/services/cheque-file.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChequeFileService {

  private apiUrl = `${environment.apiUrl}/cheques`;  // Updated to match backend endpoint

  constructor(private http: HttpClient) {}

  // Récupérer la liste des fichiers de chèque
  getChequeFiles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  // Uploader un fichier de chèque
  uploadChequeFile(dossierId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/${dossierId}/upload`, formData);
  }

  // Supprimer un fichier de chèque
  deleteChequeFile(dossierId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${dossierId}/delete`);
  }

  // Récupérer l'URL d'un fichier de chèque
  getChequeFileUrl(dossierId: number): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/${dossierId}/url`);
  }
  
  // Helper method to construct full URLs
  getFullFileUrl(relativePath: string): string {
    // Check if path is already a full URL
    if (relativePath && !relativePath.startsWith('http')) {
      return `${environment.apiUrl}${relativePath}`;
    }
    return relativePath;
  }
}