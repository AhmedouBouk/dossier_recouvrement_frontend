import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  userName: string = 'user@example.com'; // Remplacez par les données dynamiques de l'utilisateur

  constructor(private router: Router) {}

  logout() {
    // Ajoutez ici la logique de déconnexion
    console.log('Utilisateur déconnecté');
    // Par exemple, supprimer le token et rediriger
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }

}
