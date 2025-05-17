// navbar.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { filter } from 'rxjs/operators';
import { Location } from '@angular/common'; 
import { RoleGuard } from 'src/app/shared/guards/role.guard';
import { RoleService } from 'src/app/shared/services/role.service';
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
    '/garanties': 'Gestion des Garanties',
    '/dossiers': 'Dossiers Recouvrement',
    '/credits-file-management': 'Gestion des Crédits',
    '/lc-file-management': 'Lettres de Crédit',
    '/cautions-file-management': 'Gestion des Cautions',
    '/cheque-files': 'Fichiers de Chèque'
  };
  userRole: string = '';
  

  constructor(
    private authService: AuthService, 
    private router: Router,
    private location: Location,
    public roleService: RoleService
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
    this.authService.logout(); // Appeler la méthode logout du service
  }
  goBack(): void {
    this.location.back(); // Navigates to the previous page in the browser's history
  }
}
