// sidebar.component.ts
import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

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
    '/credits': 'Gestion des Crédits',
    '/dossier-recouvrement': 'Dossiers Recouvrement'
  };

  currentRoute: string = '';

  constructor(private router: Router) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.currentRoute = event.url;
    });
  }

  getActiveRoute(): string {
    return this.routes[this.currentRoute] || 'Dashboard';
  }
}