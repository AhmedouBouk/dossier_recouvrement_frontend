import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Garantie } from '../models/garantie.model';

@Injectable({
  providedIn: 'root'
})
export class GarantieService {
  private apiUrl = 'http://localhost:8080/api/Garantie';

  constructor(private http: HttpClient) {}

  // Récupérer toutes les garanties
  getAllGaranties(): Observable<Garantie[]> {
    return this.http.get<Garantie[]>(`${this.apiUrl}/Affichage`).pipe(
      catchError(this.handleError)
    );
  }

  // Récupérer une garantie par ID
  getGarantieById(id: number): Observable<Garantie> {
    return this.http.get<Garantie>(`${this.apiUrl}/lire/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Créer une garantie
  createGarantie(typeGarantie: string, valeur: number, description: string, fondDossier: string): Observable<Garantie> {
    const formData = new FormData();
    formData.append('typeGarantie', typeGarantie);
    formData.append('valeur', valeur.toString());
    formData.append('description', description);
    formData.append('fondDossier', fondDossier);


    return this.http.post<Garantie>(`${this.apiUrl}/create`, formData).pipe(
      catchError(this.handleError)
    );
  }

  // Mettre à jour une garantie
  updateGarantie(id: number, garantie: Garantie): Observable<Garantie> {
    return this.http.put<Garantie>(`${this.apiUrl}/update/${id}`, garantie).pipe(
      catchError(this.handleError)
    );
  }

  // Supprimer une garantie
  deleteGarantie(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`, { responseType: 'text' }).pipe(
      catchError(this.handleError)
    );
  }


  // Gestion des erreurs
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur : ${error.error.message}`;
    } else {
      errorMessage = `Code d'erreur : ${error.status}, Message : ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}