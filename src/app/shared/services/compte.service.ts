import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { RouterModule } from '@angular/router'; // Import de RouterModule

@Injectable({
  providedIn: 'root'
})
export class CompteService {
  private apiUrl = 'http://localhost:8080/api/comptes';

  constructor(private http: HttpClient) { }

  getAllComptes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Affichage`).pipe(
      catchError(this.handleError)
    );
  }

  searchComptes(nomCompte?: string, nom?: string, prenom?: string, nni?: number): Observable<any[]> {
    let params = new HttpParams();
    if (nomCompte) params = params.set('nomCompte', nomCompte);
    if (nom) params = params.set('nom', nom);
    if (prenom) params = params.set('prenom', prenom);
    if (nni) params = params.set('nni', nni.toString());
    
    return this.http.get<any[]>(`${this.apiUrl}/recherche`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  updateCompte(nomCompte: string, data: any): Observable<any> {
    let params = new HttpParams();
    if (data.solde) params = params.set('solde', data.solde.toString());
    if (data.etat) params = params.set('etat', data.etat);

    return this.http.put(`${this.apiUrl}/update/${nomCompte}`, null, { 
      params,
      responseType: 'text'
    }).pipe(
      catchError(this.handleError)
    );
  }

  deleteCompte(nomCompte: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${nomCompte}`, {
      responseType: 'text'
    }).pipe(
      catchError(this.handleError)
    );
  }

  importComptes(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiUrl}/import-comptes`, formData).pipe(
      map((response: any) => response),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 403) {
        errorMessage = 'Accès refusé. Veuillez vous reconnecter.';
      } else if (error.status === 404) {
        errorMessage = 'Ressource non trouvée.';
      } else if (error.status === 400) {
        errorMessage = error.error?.message || 'Requête invalide';
      } else {
        errorMessage = `Code d'erreur: ${error.status}, Message: ${error.message}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
  getCompteByNomCompte(nomCompte: string): Observable<any> {
  return this.http.get(`${this.apiUrl}/${nomCompte}`);
}

}