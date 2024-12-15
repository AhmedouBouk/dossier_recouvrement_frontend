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
      console.log(decodedToken);
      return decodedToken.role;
    }
    return '';
  }

  hasDORole(): boolean {
    return this.getUserRole() === 'DO';
  }

  hasDCRole(): boolean {
    return this.getUserRole() === 'DC';
  }

  hasEditPermission(): boolean {
    const role = this.getUserRole();
    return role === 'DO' || role === 'DC';
  }
}