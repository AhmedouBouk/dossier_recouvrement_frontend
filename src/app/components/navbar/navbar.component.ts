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
    '/garanties': 'Gestion des Garanties',
    '/credits': 'Gestion des Crédits',
    '/dossier-recouvrement': 'Dossiers Recouvrement'
  };

  constructor(
    private authService: AuthService, 
    private router: Router,
    private location: Location
  ) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.currentSection = this.routes[event.url] || 'Dashboard';
    });
  }

  ngOnInit(): void {
    this.userName = this.authService.getLoggedInUserName();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['auth/login']);
  }
  goBack(): void {
    this.location.back(); // Navigates to the previous page in the browser's history
  }
}