import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class RecouvrementRoleService {

  constructor() { }

  // Fonction pour obtenir le rôle à partir du token JWT
  getUserRole(): string {
    const token = localStorage.getItem('token');  // Utilisez localStorage ou sessionStorage en fonction de vos besoins
    if (token) {
      const decodedToken: any = jwtDecode(token);  // Décoder le token JWT
      console.log(decodedToken);  // Affichez le contenu du token pour vérifier son contenu
      return decodedToken.role;  // Assurez-vous que le rôle est sous la clé 'role' dans le token
    }
    return '';
  }
  

  // Fonction pour vérifier si l'utilisateur a le rôle 'recouvrement'
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
  
}
