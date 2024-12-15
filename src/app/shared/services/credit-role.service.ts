import { Injectable } from '@angular/core';
import {jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class CreditRoleService {
  constructor() { }

  // Function to get the role from the JWT token
  private getUserRole(): string {
    const token = localStorage.getItem('token');  // Use localStorage or sessionStorage based on your needs
    if (token) {
      const decodedToken: any = jwtDecode(token);  // Decode the JWT token
        // Log the token content for verification
      return decodedToken.role;  // Ensure the role is stored under the 'role' key in the token
    }
    return '';
  }

  // Function to check if the user has either the 'DO' or 'DC' role
  hasRole(allowedRoles: string[]): boolean {
    const userRole = this.getUserRole();
     // Log the current role in the console
    return allowedRoles.includes(userRole);  // Check if the user's role is included in the allowed roles
  }
}