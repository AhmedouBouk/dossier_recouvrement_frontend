import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Credit, CreditDTO } from '../models/credit.model';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class CreditService {
  private apiUrl = `${environment.apiUrl}/credit`;

  constructor(private http: HttpClient) {
    
  }

  uploadCSV(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/import-credit`, formData);
  }
  
  getAllCredits(): Observable<Credit[]> {
    return this.http.get<Credit[]>(`${this.apiUrl}/Affichage`);
  }

  searchCredits(nomCompte: string): Observable<Credit[]> {
    const params = new HttpParams().set('nomCompte', nomCompte);
    return this.http.get<Credit[]>(`${this.apiUrl}/recherche`, { params });
  }

  getCreditDetails(creditId: number): Observable<Credit> {
    return this.http.get<Credit>(`${this.apiUrl}/lire/${creditId}`);
  }

  addCredit(creditDTO: CreditDTO): Observable<Credit> {
    return this.http.post<Credit>(`${this.apiUrl}/create`, creditDTO);
  }

  updateCredit(creditId: number, creditDTO: CreditDTO): Observable<Credit> {
    // Convertir l'objet creditDTO en chaîne JSON
    const creditDTOString = JSON.stringify(creditDTO);
  
    // Ajouter le paramètre 'credit' à l'URL
    const url = `${this.apiUrl}/update/${creditId}?credit=${encodeURIComponent(creditDTOString)}`;
  
    return this.http.put<Credit>(url, null); // Envoyer une requête PUT avec un corps vide
  }

  deleteCredit(creditId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${creditId}`);
  }
  rechercherParNomCompte(nomCompte: string): Observable<Credit[]> {
    const url = `${this.apiUrl}/recherche?nomCompte=${nomCompte}`;
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    });
    return this.http.get<Credit[]>(url, { headers });
  }
 
}