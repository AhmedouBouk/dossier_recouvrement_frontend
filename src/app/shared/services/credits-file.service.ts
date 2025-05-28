// src/app/shared/services/credits-file.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CreditsFileService {
  private apiUrl = `${environment.apiUrl}/credits`;

  constructor(private http: HttpClient) {}

  // Uploader un fichier de crédit
  uploadCreditsFile(dossierId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/${dossierId}/upload`, formData);
  }

  // Supprimer un fichier de crédit
  deleteCreditsFile(dossierId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${dossierId}/delete`);
  }

  // Récupérer l'URL du fichier de crédit
  
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

}