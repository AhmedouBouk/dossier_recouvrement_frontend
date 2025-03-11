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

// Ajoutez ces méthodes dans votre RoleService

// Mise en demeure permissions
hasCreateMiseEnDemeurePermission(): boolean {
  return this.authService.hasPermission('CREATE_MISE_EN_DEMEURE');
}

hasReadMiseEnDemeurePermission(): boolean {
  return this.authService.hasPermission('READ_MISE_EN_DEMEURE');
}

hasUpdateMiseEnDemeurePermission(): boolean {
  return this.authService.hasPermission('UPDATE_MISE_EN_DEMEURE');
}

hasDeleteMiseEnDemeurePermission(): boolean {
  return this.authService.hasPermission('DELETE_MISE_EN_DEMEURE');
}
}