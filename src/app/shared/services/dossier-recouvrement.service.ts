import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DossierRecouvrement } from '../models/dossier-recouvrement';
import { environment } from './../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class DossierRecouvrementService {
  private apiUrl = `${environment.apiUrl}/DossierRecouvrement`;  // L'URL de votre backend

  constructor(private http: HttpClient) {}

  // Méthode pour obtenir un dossier par son ID
  getDossierById(id: number): Observable<DossierRecouvrement> {
    return this.http.get<DossierRecouvrement>(`${this.apiUrl}/lire/${id}`);
  }
// dossier-recouvrement.service.ts
getDossiers(): Observable<DossierRecouvrement[]> {
  return this.http.get<DossierRecouvrement[]>(`${this.apiUrl}/Affichage`);
}

  // Méthode pour mettre à jour un dossier existant
  updateDossier(id: number, dossier: DossierRecouvrement): Observable<DossierRecouvrement> {
    return this.http.put<DossierRecouvrement>(`${this.apiUrl}/update/${id}`, dossier);
  }

  // Méthode pour supprimer un dossier
  deleteDossier(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}
