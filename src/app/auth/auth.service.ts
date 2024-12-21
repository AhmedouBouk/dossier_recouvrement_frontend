import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, interval, Subscription } from 'rxjs';
import { AuthRequest } from '../shared/models/auth-request.model';
import { AuthResponse } from '../shared/models/auth-response.model';
import { environment } from './../../environments/environment';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

interface DecodedToken {
  sub: string;  // email
  role: string;
  exp: number;
  iat: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenCheckInterval!: Subscription;
  private readonly CHECK_INTERVAL = 60000; // Check every minute
  private failedAttempts = 0;
  private lockoutEndTime: number | null = null;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.setupTokenExpirationCheck();
  }

  ngOnDestroy() {
    if (this.tokenCheckInterval) {
      this.tokenCheckInterval.unsubscribe();
    }
  }

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
          this.setupTokenExpirationCheck();
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    window.location.reload();
  }

  private setupTokenExpirationCheck(): void {
    if (this.tokenCheckInterval) {
      this.tokenCheckInterval.unsubscribe();
    }
    
    // Initial check
    this.checkTokenExpiration();

    // Set up periodic checks
    this.tokenCheckInterval = interval(this.CHECK_INTERVAL).subscribe(() => {
      this.checkTokenExpiration();
    });
  }

  private checkTokenExpiration(): void {
    if (!this.isAuthenticated()) {
      this.handleExpiredToken();
    }
  }

  private handleExpiredToken(): void {
    if (localStorage.getItem('token')) {
      this.logout();
      alert('Votre session a expiré. Veuillez vous reconnecter.');
    }
  }

  private getUserRole(): string {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.role;
    }
    return '';
  }

  hasRecouvrementRole(): boolean {
    const role = this.getUserRole();
    console.log('Role actuel:', role);
    return role === 'RECOUVREMENT';
  }

  hasDGCRRole(): boolean {
    const role = this.getUserRole();
    console.log('Role actuel:', role);
    return role === 'DGCR';
  }

  hasDODCRole(): boolean {
    const role = this.getUserRole();
    console.log('Role actuel:', role);
    return role === 'DO' || role === 'DC';
  }

  hasRoleNotAdmin(): boolean {
    const role = this.getUserRole();
    console.log('Role actuel:', role);
    return role !== 'ADMIN';
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

  // Helper methods for role-based access control
  hasAnyRole(roles: string[]): boolean {
    const userRole = this.getUserRole();
    return roles.includes(userRole);
  }

  isAuthorized(allowedRoles: string[]): boolean {
    if (!this.isAuthenticated()) return false;
    return this.hasAnyRole(allowedRoles);
  }
}