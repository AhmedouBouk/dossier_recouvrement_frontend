import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, interval, Subscription } from 'rxjs';
import { environment } from './../../environments/environment';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

interface DecodedToken {
  sub: string;  // email
  role: string;
  permissions: string[];
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

  login(credentials: { email: string; password: string }) {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          const decodedToken = this.decodeToken(response.token);
          if (decodedToken && decodedToken.role) {
            const formattedRole = decodedToken.role.startsWith("ROLE_") ? decodedToken.role : "ROLE_" + decodedToken.role;
            localStorage.setItem('role', formattedRole);
          }
        })
      );
  }
  

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.router.navigate(['/auth/login']);
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

  getUserRole(): string {
    const role = localStorage.getItem('role') || '';
    return role.startsWith('ROLE_') ? role : `ROLE_${role}`;
  }

  getRole(): string | null {
    return this.getUserRole();
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

  decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (e) {
      return null;
    }
  }

  getUserPermissions(): string[] {
    const token = localStorage.getItem('token');
    if (!token) return [];
    
    const decodedToken = this.decodeToken(token);
    if (!decodedToken || !decodedToken.permissions) return [];
    
    return decodedToken.permissions;
  }
  
  hasPermission(permission: string): boolean {
    const permissions = this.getUserPermissions();
    return permissions.includes(permission) ;  // boolean 
  }



  

  isAdmin(): boolean {
    return this.getUserRole() === 'ROLE_ADMIN';
  }

  isNotAdmin(): boolean {
    return this.getUserRole() !== 'ROLE_ADMIN';
  }

  isAuthorized(allowedRoles: string[]): boolean {
    if (!this.isAuthenticated()) return false;
    return allowedRoles.includes(this.getUserRole());
  }

  // Restored Methods to Prevent Errors in Other Components
  hasRoleNotAdmin(): boolean {
    const role = this.getUserRole();
    return role !== 'ROLE_ADMIN';
  }

  hasRecouvrementRole(): boolean {
    return this.getUserRole() === 'ROLE_RECOUVREMENT';
  }

  hasDGCRRole(): boolean {
    return this.getUserRole() === 'ROLE_DGCR';
  }

  hasDORole(): boolean {
    return this.getUserRole() === 'ROLE_DO';
  }
}
