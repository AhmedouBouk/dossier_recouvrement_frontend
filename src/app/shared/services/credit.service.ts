import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Credit, CreditDTO } from '../models/credit.model';

@Injectable({
  providedIn: 'root'
})
export class CreditService {
  private apiUrl = 'http://localhost:8080/api/credit';

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
    return this.http.put<Credit>(`${this.apiUrl}/update/${creditId}`, creditDTO);
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