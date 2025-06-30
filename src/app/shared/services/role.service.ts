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

  // General permission check method
  hasPermission(permission: string): boolean {
    return this.authService.hasPermission(permission);
  }
  

  // Client permissions
hasReadClientPermission(): boolean {
  return this.authService.hasPermission('READ_CLIENT');
}
hasCommantairePermission(): boolean {
  return this.authService.hasPermission('COMMENTAIRE_DOSSIER');
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
// Fonctions pour les permissions liées à GRANTIE
hasImportGrantiePermission(): boolean {
  return this.authService.hasPermission('IMPORT_GRANTIE');
}

hasReadGrantiePermission(): boolean {
  return this.authService.hasPermission('READ_GRANTIE');
}

hasUpdateGrantiePermission(): boolean {
  return this.authService.hasPermission('UPDATE_GRANTIE');
}

hasDeleteGrantiePermission(): boolean {
  return this.authService.hasPermission('DELETE_GRANTIE');
}

hasDownloadGrantiePermission(): boolean {
  return this.authService.hasPermission('DOWNLOAD_GRANTIE');
}

// Fonctions pour les permissions liées à CHEQUE
hasImportChequePermission(): boolean {
  return this.authService.hasPermission('IMPORT_CHEQUE');
}

hasReadChequePermission(): boolean {
  return this.authService.hasPermission('READ_CHEQUE');
}

hasUpdateChequePermission(): boolean {
  return this.authService.hasPermission('UPDATE_CHEQUE');
}

hasDeleteChequePermission(): boolean {
  return this.authService.hasPermission('DELETE_CHEQUE');
}

hasDownloadChequePermission(): boolean {
  return this.authService.hasPermission('DOWNLOAD_CHEQUE');
}
hasCreateCreditPermission(): boolean {
  return this.authService.hasPermission('CREATE_CREDIT');
}

hasReadCreditPermission(): boolean {
  return this.authService.hasPermission('READ_CREDIT');
}

hasUpdateCreditPermission(): boolean {
  return this.authService.hasPermission('UPDATE_CREDIT');
}

hasDeleteCreditPermission(): boolean {
  return this.authService.hasPermission('DELETE_CREDIT');
}

hasDownloadCreditFilePermission(): boolean {
  return this.authService.hasPermission('DOWNLOAD_CREDIT_FILE');
}

hasUploadCreditFilePermission(): boolean {
  return this.authService.hasPermission('UPLOAD_CREDIT_FILE');
}
hasCreateLcPermission(): boolean {
  return this.authService.hasPermission('CREATE_LC');
}

hasReadLcPermission(): boolean {
  return this.authService.hasPermission('READ_LC');
}

hasUpdateLcPermission(): boolean {
  return this.authService.hasPermission('UPDATE_LC');
}

hasDeleteLcPermission(): boolean {
  return this.authService.hasPermission('DELETE_LC');
}

hasDownloadLcFilePermission(): boolean {
  return this.authService.hasPermission('DOWNLOAD_LC_FILE');
}

hasUploadLcFilePermission(): boolean {
  return this.authService.hasPermission('UPLOAD_LC_FILE');
}
hasCreateCautionPermission(): boolean {
  return this.authService.hasPermission('CREATE_CAUTION');
}

hasReadCautionPermission(): boolean {
  return this.authService.hasPermission('READ_CAUTION');
}

hasUpdateCautionPermission(): boolean {
  return this.authService.hasPermission('UPDATE_CAUTION');
}

hasDeleteCautionPermission(): boolean {
  return this.authService.hasPermission('DELETE_CAUTION');
}

hasDownloadCautionFilePermission(): boolean {
  return this.authService.hasPermission('DOWNLOAD_CAUTION_FILE');
}

hasUploadCautionFilePermission(): boolean {
  return this.authService.hasPermission('UPLOAD_CAUTION_FILE');
}



hasReadDossierRecouvrementPermission(): boolean {
  return this.authService.hasPermission('READ_DOSSIERRECOUVREMENT');
}
hasCreateDossierRecouvrementPermission(): boolean {
  return this.authService.hasPermission('CREATE_DOSSIERRECOUVREMENT');
}


hasDeleteDossierRecouvrementPermission(): boolean {
  return this.authService.hasPermission('DELETE_DOSSIERRECOUVREMENT');
}

hasUpdateDossierRecouvrementPermission(): boolean {
  return this.authService.hasPermission('UPDATE_DOSSIERRECOUVREMENT');
}

hasDownloadMiseEnDemeurePermission(): boolean {
  return this.authService.hasPermission('DOWNLOAD_MISE_EN_DEMEURE');
}

hasCommentairePermission(): boolean {
  return this.authService.hasPermission('COMMENTAIRE_DOSSIER');
}

hasValidationPermission(): boolean {
  return this.authService.hasPermission('VALIDATION_DOSSIER');
}
hasReadArchivePermission(): boolean {
  return this.authService.hasPermission('READ_ARCHIVES'); // 
}
isNotAdmin(): boolean {
  return this.authService.getUserRole() !== 'ROLE_ADMIN';
}


}