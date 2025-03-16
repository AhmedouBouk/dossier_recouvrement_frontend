import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { DossierRecouvrement } from '../models/dossier-recouvrement.model';
import { environment } from './../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DossierRecouvrementService {
  private apiUrl = `${environment.apiUrl}/dossiers`;  // Updated to match backend endpoint

  constructor(private http: HttpClient) {}

  // Get all dossiers
  getDossiers(): Observable<DossierRecouvrement[]> {
    return this.http.get<DossierRecouvrement[]>(`${this.apiUrl}/affichage`);
  }
  getDossiersSansGarantie(): Observable<DossierRecouvrement[]> {
    return this.http.get<DossierRecouvrement[]>(`${this.apiUrl}/sans-garantie`);
  }

  // Get dossier by ID
  getDossierById(id: number): Observable<DossierRecouvrement> {
    return this.http.get<DossierRecouvrement>(`${this.apiUrl}/${id}`);
  }

  // Create new dossier
  createDossier(dossier: DossierRecouvrement): Observable<DossierRecouvrement> {
    return this.http.post<DossierRecouvrement>(`${this.apiUrl}/create`, dossier);
  }

  // Update dossier
  updateDossier(id: number, dossier: DossierRecouvrement): Observable<DossierRecouvrement> {
    return this.http.put<DossierRecouvrement>(`${this.apiUrl}/update/${id}`, dossier);
  }
  getChequeFileUrl(dossierId: number): Observable<string | null> {
    return this.http.get(`${this.apiUrl}/${dossierId}/cheque-file`, { responseType: 'text' }).pipe(
      catchError((error) => {
        console.error('Erreur lors de la récupération de l\'URL du fichier :', error);
        return of(null); // Retourne null en cas d'erreur
      })
    );
  }
  // Delete dossier
  deleteDossier(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/delete/${id}`);
  }

  // Search dossiers
  searchDossiers(params: { dossierId?: number, numeroCompte?: string, nomClient?: string }): Observable<DossierRecouvrement[]> {
    let queryParams = new URLSearchParams();
    if (params.dossierId) queryParams.append('dossierId', params.dossierId.toString());
    if (params.numeroCompte) queryParams.append('numeroCompte', params.numeroCompte);
    if (params.nomClient) queryParams.append('nomClient', params.nomClient);

    return this.http.get<DossierRecouvrement[]>(`${this.apiUrl}/recherche?${queryParams}`);
  }

  // Import dossiers from CSV file
  importDossiers(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/import`, formData);
  }
  uploadGarantie(dossierId: number, formData: FormData): Observable<DossierRecouvrement> {
    return this.http.post<DossierRecouvrement>(`${this.apiUrl}/${dossierId}/garantie`, formData);
  }
 

  // Uploader un fichier de chèque
  uploadChequeFile(dossierId: number, file: File): Observable<DossierRecouvrement> {
    const formData = new FormData();
    formData.append('file', file);
  
    return this.http.post<DossierRecouvrement>(`${this.apiUrl}/${dossierId}/upload-cheque`, formData);
  }

  // Supprimer un fichier de chèque
  deleteChequeFile(dossierId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${dossierId}/cheque-files`);
  }

  generatePdf(dossierId: number) {
    return this.http.get(`${this.apiUrl}/${dossierId}/generate-pdf`, { responseType: 'blob' });
  }
  // Get comments for a dossier
getComments(dossierId: number): Observable<any[]> {
  return this.http.get<any[]>(`${environment.apiUrl}/api/dossiers/${dossierId}/comments`);
}

// Add a comment to a dossier
addComment(dossierId: number, content: string): Observable<any> {
  return this.http.post(`${environment.apiUrl}/api/dossiers/${dossierId}/comments`, { content });
}
  }
