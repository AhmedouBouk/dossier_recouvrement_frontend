import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthRequest } from '../shared/models/auth-request.model';
import { AuthResponse } from '../shared/models/auth-response.model';
import { environment } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<AuthResponse> {
    const authRequest: AuthRequest = { email, password };
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, authRequest)
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('userRole', response.role);
        })
      );
  }
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
  }

  getRole(): string | null {
    return localStorage.getItem('userRole');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getLoggedInUserName(): string {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1])); // Decodes the token's payload
        return payload.username || payload.sub || 'Utilisateur inconnu';
      } catch (error) {
        console.error('Error decoding token:', error);
        return 'Utilisateur inconnu';
      }
    }
    return 'Utilisateur non connecté';
  }
}
