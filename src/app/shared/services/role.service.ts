import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from 'src/app/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  constructor(private authService: AuthService) {}

  getUserRole(): string {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.role;
    }
    return '';
  }

  hasDORole(): boolean {
    // Vérifier si l'utilisateur a les permissions liées aux opérations de crédit
    return this.authService.hasPermission('CREATE_CREDIT') || 
           this.authService.hasPermission('UPDATE_CREDIT') || 
           this.getUserRole() === 'DIRECTION_OPERATIONS';
  }
  hasEditPermission(): boolean {
    // Vérifier si l'utilisateur a les permissions liées aux opérations de crédit
    return this.authService.hasPermission('CREATE_CREDIT') || 
           this.authService.hasPermission('UPDATE_CREDIT') || 
           this.getUserRole() === 'DIRECTION_OPERATIONS';
  }

 
  

  // Client permissions
hasReadClientPermission(): boolean {
  return this.authService.hasPermission('READ_CLIENT');
}

hasUpdateClientPermission(): boolean {
  return this.authService.hasPermission('UPDATE_CLIENT');
}

hasDeleteClientPermission(): boolean {
  return this.authService.hasPermission('DELETE_CLIENT');
}

hasImportClientPermission(): boolean {
  return this.authService.hasPermission('IMPORT_CLIENT');
}

// Compte permissions
hasCreateComptePermission(): boolean {
  return this.authService.hasPermission('CREATE_COMPTE');
}

hasReadComptePermission(): boolean {
  return this.authService.hasPermission('READ_COMPTE');
}

hasUpdateComptePermission(): boolean {
  return this.authService.hasPermission('UPDATE_COMPTE');
}

hasDeleteComptePermission(): boolean {
  return this.authService.hasPermission('DELETE_COMPTE');
}
}