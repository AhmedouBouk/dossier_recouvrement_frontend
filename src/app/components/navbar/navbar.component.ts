// navbar.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { filter } from 'rxjs/operators';
import { Location } from '@angular/common'; 
interface RouteMap {
  [key: string]: string;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  userName: string = 'Utilisateur non connecté';
  currentSection: string = 'Dashboard';

  routes: RouteMap = {
    '/dashboard': 'Dashboard',
    '/clients': 'Gestion des Clients',
    '/comptes': 'Gestion des Comptes',
    '/credits': 'Gestion des Crédits',
    '/credits/add': 'Ajouter un Crédit',
    '/credits/edit': 'Modifier le Crédit',
    '/dossier-recouvrement': 'Dossiers Recouvrement',
    '/dossier-recouvrement/view': 'Détails du Dossier',
    '/dossier-recouvrement/modify': 'Modifier le Dossier',
  };
  userRole: string = '';

  constructor(
    private authService: AuthService, 
    private router: Router,
    private location: Location
  ) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.currentSection = this.routes[event.url] || this.currentSection ;
    });
  }

  ngOnInit(): void {
    this.userName = this.authService.getLoggedInUserName();
    this.userRole = this.authService.getRole() || 'No Role';
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    window.location.reload();
  }
  goBack(): void {
    this.location.back(); // Navigates to the previous page in the browser's history
  }
}