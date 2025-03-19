import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DossierRecouvrement } from '../models/dossier-recouvrement.model';

@Injectable({
  providedIn: 'root',
})
export class GarantieService {
  private apiUrl = `${environment.apiUrl}/grantie`;

  constructor(private http: HttpClient) {}

  // Récupérer les dossiers sans garantie
  getAllDossiers(): Observable<DossierRecouvrement[]> {
    return this.http.get<DossierRecouvrement[]>(`${this.apiUrl}`);
  }
  updateGarantie(id: number, garantie: DossierRecouvrement): Observable<DossierRecouvrement> {
    return this.http.put<DossierRecouvrement>(`${this.apiUrl}/${id}`, garantie);
  }

  // Uploader un fichier de garantie
  uploadGarantie(dossierId: number, file: File, titre: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('titre', titre);
    return this.http.post(`${this.apiUrl}/${dossierId}/garantie`, formData);
  }

  // Récupérer l'URL du fichier de garantie
  getGarantieFileUrl(dossierId: number): Observable<string> {
    return this.http.get(`${this.apiUrl}/${dossierId}/garantie/url`, { responseType: 'text' });
  }

  // Supprimer un fichier de garantie
  deleteGarantieFile(dossierId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${dossierId}/garantie/delete`);
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