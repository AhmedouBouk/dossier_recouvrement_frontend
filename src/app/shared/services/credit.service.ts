import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Credit } from '../models/credit.model';

@Injectable({
  providedIn: 'root'
})
export class CreditService {
  private apiUrl = 'http://localhost:8080/credit';

  constructor(private http: HttpClient) {}

  // Récupérer tous les crédits
  getAllCredits(): Observable<Credit[]> {
    return this.http.get<Credit[]>(`${this.apiUrl}/Affichage`).pipe(
      catchError(this.handleError)
    );
  }

  // Récupérer un crédit par ID
  getCreditById(id: number): Observable<Credit> {
    return this.http.get<Credit>(`${this.apiUrl}/lire/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Rechercher des crédits par nom de compte
  searchCreditsByNomCompte(nomCompte: string): Observable<Credit[]> {
    const params = new HttpParams().set('nomCompte', nomCompte);
    return this.http.get<Credit[]>(`${this.apiUrl}/recherche`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  // Créer un crédit
  createCredit(creditDTO: any, files: any): Observable<Credit> {
    const formData = new FormData();
    formData.append('creditdto', JSON.stringify(creditDTO));
    for (const key in files) {
      if (files[key]) {
        formData.append(key, files[key]);
      }
    }
    return this.http.post<Credit>(`${this.apiUrl}/create`, formData).pipe(
      catchError(this.handleError)
    );
  }

  // Mettre à jour un crédit
  updateCredit(id: number, creditDTO: any, files: any): Observable<Credit> {
    const formData = new FormData();
    formData.append('credit', JSON.stringify(creditDTO));
    for (const key in files) {
      if (files[key]) {
        formData.append(key, files[key]);
      }
    }
    return this.http.put<Credit>(`${this.apiUrl}/update/${id}`, formData).pipe(
      catchError(this.handleError)
    );
  }

  // Supprimer un crédit
  deleteCredit(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`, { responseType: 'text' }).pipe(
      catchError(this.handleError)
    );
  }

  // Télécharger tous les documents d'un crédit
  downloadAllDocuments(id: number): Observable<string> {
    return this.http.get(`${this.apiUrl}/telecharger/${id}`, { responseType: 'text' }).pipe(
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
