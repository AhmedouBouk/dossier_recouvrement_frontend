import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = 'http://localhost:8080/api/clients';

  constructor(private http: HttpClient) { }

  importClients(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/import-client`, formData, {
      responseType: 'text',
      observe: 'response'
    });
  }

  getAllClients(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Affichage`);
  }

  searchClients(nom?: string, prenom?: string, nni?: number): Observable<any[]> {
    let params = new HttpParams();
    if (nom) params = params.set('nom', nom);
    if (prenom) params = params.set('prenom', prenom);
    if (nni) params = params.set('nni', nni);
    return this.http.get<any[]>(`${this.apiUrl}/recherche`, { params });
  }

  updateClient(nni: number, data: any): Observable<string> {
    let params = new HttpParams();
    if (data.nom) params = params.set('nom', data.nom);
    if (data.prenom) params = params.set('prenom', data.prenom);
    if (data.adresse) params = params.set('adresse', data.adresse);
    if (data.salaire) params = params.set('salaire', data.salaire.toString());
    if (data.secteurActivite) params = params.set('secteurActivite', data.secteurActivite);
    
    return this.http.put(`${this.apiUrl}/update/${nni}`, null, {
      params,
      responseType: 'text'
    });
  }

  deleteClient(nni: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/delete/${nni}`, {
      responseType: 'text'
    });
  }
}