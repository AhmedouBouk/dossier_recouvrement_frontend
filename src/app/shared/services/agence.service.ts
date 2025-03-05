import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Agence {
  id: number;
  code: string;
  nom: string;
}

@Injectable({
  providedIn: 'root'
})
export class AgenceService {
  private apiUrl = `${environment.apiUrl}/agences`;

  constructor(private http: HttpClient) {}

  // Récupérer toutes les agences
  getAllAgences(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // Récupérer une agence par son ID
  getAgenceById(id: number): Observable<Agence> {
    return this.http.get<Agence>(`${this.apiUrl}/${id}`);
  }

  // Créer une nouvelle agence
  createAgence(agence: Omit<Agence, 'id'>): Observable<Agence> {
    return this.http.post<Agence>(this.apiUrl, agence);
  }

  // Mettre à jour une agence existante
  updateAgence(id: number, agence: Omit<Agence, 'id'>): Observable<Agence> {
    return this.http.put<Agence>(`${this.apiUrl}/${id}`, agence);
  }

  // Supprimer une agence
  deleteAgence(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
