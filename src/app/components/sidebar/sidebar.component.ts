// sidebar.component.ts
import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { RoleService } from '../../shared/services/role.service';

interface RouteMap {
  [key: string]: string;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
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

  currentRoute: string = '';

  constructor(private router: Router, public roleService: RoleService) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.currentRoute = event.url;
    });
  }

  getActiveRoute(): string {
    // Vérifier d'abord la correspondance exacte
    if (this.routes[this.currentRoute]) {
      return this.routes[this.currentRoute];
    }
    
    // Si pas de correspondance exacte, vérifier les sous-routes
    const matchingRoute = Object.keys(this.routes).find(route => 
      this.currentRoute.startsWith(route) && route !== '/'
    );
    
    // Si une sous-route correspond, retourner son libellé
    if (matchingRoute) {
      return this.routes[matchingRoute];
    }
    
    // Par défaut, retourner 'Dashboard'
    return 'Dashboard';
  }
}