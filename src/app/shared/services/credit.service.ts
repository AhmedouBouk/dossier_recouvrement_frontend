import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CreditService {
  private apiUrl = 'http://localhost:8080/api/credit';

  constructor(private http: HttpClient) {}

  /**
   * Get all credits.
   */
  getAllCredits(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Affichage`);
  }

  /**
   * Search credits by account name.
   * @param accountName Name of the account.
   */
  searchCredits(searchTerm: string): Observable<any[]> {
    let params = new HttpParams()
      .set('nomCompte', searchTerm)
      .set('idCredit', searchTerm)
      .set('statut', searchTerm);
    return this.http.get<any[]>(`${this.apiUrl}/recherche`, { params });
  }

  /**
   * Get credit details by ID.
   * @param creditId ID of the credit.
   */
  getCreditsDetails(creditId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/lire/${creditId}`).pipe(
      map(response => {
        // Log the raw response
        console.log('Raw credit details:', response);
        
        // Ensure we have a properly structured object
        return {
          ...response,
          idCompte: response.idCompte || response.compte?.nomCompte || '',
          idGarantie: response.idGarantie || response.garantie?.id || '',
          montant: response.montant || 0,
          tauxInteret: response.tauxInteret || 0,
          duree: response.duree || 0,
          dateDebut: response.dateDebut || '',
          statut: response.statut || '',
          refTransaction: response.refTransaction || ''
        };
      })
    );
  }

  /**
   * Create a new credit.
   * @param creditData FormData object containing credit details and files.
   */
  addCredit(creditData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, creditData);
  }

  /**
   * Update an existing credit.
   * @param creditId ID of the credit to update.
   * @param creditData FormData object containing updated credit details and files.
   */
  updateCredit(creditId: number, creditData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${creditId}`, creditData);
  }

  /**
   * Delete a credit by ID.
   * @param creditId ID of the credit to delete.
   */
  deleteCredit(creditId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${creditId}`);
  }

  /**
   * Download all files related to a credit.
   * @param creditId ID of the credit.
   */
  downloadFile(creditId: number, fileType: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/telecharger/${creditId}`, {
      responseType: 'blob'
    });
  }
  
}