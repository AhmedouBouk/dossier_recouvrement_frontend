import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  constructor() {}

  getUserRole(): string {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.role;
    }
    return '';
  }

  hasDORole(): boolean {
    return this.getUserRole() === 'DO';
  }

 
  hasEditPermission(): boolean {
    const role = this.getUserRole();
    return role === 'DC';
  }
}