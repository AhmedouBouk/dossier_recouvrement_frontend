import { Injectable } from '@angular/core';
import {jwtDecode} from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class GarantieRoleService {
  constructor() { }

  // Function to get the role from the JWT token
  private getUserRole(): string {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken: any = jwtDecode(token);
      console.log(decodedToken);
      return decodedToken.role;
    }
    return '';
  }

  // Function to check if the user has any of the allowed roles
  hasRole(allowedRoles: string[]): boolean {
    const userRole = this.getUserRole();
    console.log('Current Role:', userRole);
    return allowedRoles.includes(userRole);
  }
}