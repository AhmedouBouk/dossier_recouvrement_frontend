import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthRequest } from '../shared/models/auth-request.model';
import { AuthResponse } from '../shared/models/auth-response.model';
import { environment } from './../../environments/environment';
import {jwtDecode } from 'jwt-decode';

interface DecodedToken {
  sub: string;  // email
  role: string;
  exp: number;
  iat: number;
}


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
          const decodedToken = this.decodeToken(response.token);
          if (decodedToken) {
            localStorage.setItem('userRole', decodedToken.role);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    window.location.reload();
  }
  private getUserRole(): string {
    const token = localStorage.getItem('token');  // Use localStorage or sessionStorage based on your needs
    if (token) {
      const decodedToken: any = jwtDecode(token);  // Decode the JWT token
        // Log the token content for verification
      return decodedToken.role;  // Ensure the role is stored under the 'role' key in the token
    }
    return '';
  }
  hasRecouvrementRole(): boolean {
    const role = this.getUserRole();
    console.log('Role actuel:', role);  // Vérifiez le rôle dans la console
    return role === 'RECOUVREMENT';  // Vérifier si le rôle est 'recouvrement'
  }
  hasDGCRRole(): boolean {
    const role = this.getUserRole();
    console.log('Role actuel:', role);  // Vérifiez le rôle dans la console
    return role === 'DGCR';  // Vérifier si le rôle est 'recouvrement'
  }
  hasDODCRole(): boolean {
    const role = this.getUserRole();
    console.log('Role actuel:', role);  // Vérifiez le rôle dans la console
    return role === 'DC'||role==='DO';  // Vérifier si le rôle est 'recouvrement'
  }
  hasRoleNotAdmin(): boolean {
    const role = this.getUserRole();
    console.log('Role actuel:', role);  // Vérifiez le rôle dans la console
    return role !=='ADMIN';  // Vérifier si le rôle est 'recouvrement'
  }
  getRole(): string | null {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = this.decodeToken(token);
      return decodedToken?.role || null;
    }
    return null;
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;

    const decodedToken = this.decodeToken(token);
    if (!decodedToken) return false;

    // Check if token is expired
    const currentTime = Date.now() / 1000;
    return decodedToken.exp > currentTime;
  }

  getLoggedInUserName(): string {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = this.decodeToken(token);
      return decodedToken?.sub || 'Utilisateur inconnu';
    }
    return 'Utilisateur non connecté';
  }


  private decodeToken(token: string): DecodedToken | null {
    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
}