import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CreditService {
  private apiUrl = 'http://localhost:8080/credit';

  constructor(private http: HttpClient) {}

  getAllCredits(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }

  searchCredits(searchTerm: string): Observable<any[]> {
    let params = new HttpParams().set('searchTerm', searchTerm);
    return this.http.get<any[]>(`${this.apiUrl}/search`, { params });
  }

  getCreditsDetails(creditId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/details/${creditId}`);
  }

  addCredit(creditData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, creditData);
  }

  updateCredit(creditId: number, creditData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${creditId}`, creditData);
  }

  deleteCredit(creditId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${creditId}`);
  }

  downloadFile(creditId: number, fileType: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/file/${creditId}/${fileType}`, {
      responseType: 'blob'
    });
  }
}
