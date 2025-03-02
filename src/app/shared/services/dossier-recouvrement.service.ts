import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
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
}
