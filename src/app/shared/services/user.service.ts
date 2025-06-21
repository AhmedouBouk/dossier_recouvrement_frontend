import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  name: string;
  email: string;
  userType: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  /**
   * Récupère tous les utilisateurs
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  /**
   * Récupère les utilisateurs par type
   * @param userType Le type d'utilisateur
   */
  getUsersByType(userType: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/type/${userType}`);
  }

  /**
   * Récupère les utilisateurs par types (plusieurs types)
   * @param userTypes Les types d'utilisateurs
   */
  getUsersByTypes(userTypes: string[]): Observable<User[]> {
    // Construire la chaîne de requête pour les types
    const typesParam = userTypes.join(',');
    return this.http.get<User[]>(`${this.apiUrl}/types?types=${typesParam}`);
  }
}
