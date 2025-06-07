import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DossierRecouvrement } from '../models/dossier-recouvrement.model';
import { Garantie } from '../models/garantie.model';

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
  uploadGarantie(dossierId: number, file: File, titre: string): Observable<DossierRecouvrement> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('titre', titre);

    return this.http.post<DossierRecouvrement>(
      `${this.apiUrl}/${dossierId}/garantie`,
      formData
    );
  }
  
  // Récupérer toutes les garanties d'un dossier
  getGarantiesByDossierId(dossierId: number): Observable<Garantie[]> {
    return this.http.get<Garantie[]>(`${this.apiUrl}/${dossierId}/garanties`);
  }
  
  // Récupérer une garantie par son ID
  getGarantieById(garantieId: number): Observable<Garantie> {
    return this.http.get<Garantie>(`${this.apiUrl}/garantie/${garantieId}`);
  }

  // Mettre à jour le titre d'une garantie
  updateGarantieTitre(garantieId: number, nouveauTitre: string): Observable<Garantie> {
    const formData = new FormData();
    formData.append('titre', nouveauTitre);
    
    return this.http.put<Garantie>(
      `${this.apiUrl}/garantie/${garantieId}`,
      formData
    );
  }

  // Télécharger le PDF d'une garantie
  getGarantiePdf(garantieId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/garantie/${garantieId}/pdf`, {
      responseType: 'blob'
    });
  }

  // Récupérer l'URL du fichier de garantie
  getGarantieFileUrl(dossierId: number): Observable<string> {
    return this.http.get(`${this.apiUrl}/${dossierId}/garantie/url`, { responseType: 'text' });
  }

  // Supprimer un fichier de garantie
  deleteGarantieFile(dossierId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${dossierId}/garantie/delete`);
  }

  // Supprimer une garantie par son ID
  deleteGarantie(garantieId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/garantie/${garantieId}`);
  }

  // Helper method to construct full URLs
  getFullFileUrl(relativePath: string): string {
    // Check if path is already a full URL
    if (relativePath && !relativePath.startsWith('http')) {
      return `${environment.apiUrl}${relativePath}`;
    }
    return relativePath;
  }

downloadPdfByDossier(id: number): Observable<Blob> {
  return this.http.get(`/api/garanties/pdf/${id}`, {
    responseType: 'blob'
  });
}

}