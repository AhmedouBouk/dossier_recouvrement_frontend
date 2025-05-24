// navbar.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { filter } from 'rxjs/operators';
import { Location } from '@angular/common'; 
import { Subscription, interval } from 'rxjs';
import { RoleGuard } from 'src/app/shared/guards/role.guard';
import { RoleService } from 'src/app/shared/services/role.service';

import { DossierRecouvrementService } from 'src/app/shared/services/dossier-recouvrement.service';
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
    public roleService: RoleService ,
    private dossierService: DossierRecouvrementService
  ) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.currentSection = this.routes[event.url] || this.currentSection ;
    });

    
  }
  currentRoute: string = '';
 // ✅ Propriété pour le compteur d'archives
  nombreArchives: number = 0;
  private subscriptions: Subscription[] = [];
 
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

  loadArchiveCount(): void {
    const countSub = this.dossierService.countDossiersArchives().subscribe({
      next: (count) => {
        this.nombreArchives = count;
        console.log('📊 Nombre d\'archives:', count);
      },
      error: (error) => {
        console.error('❌ Erreur lors du comptage des archives:', error);
        this.nombreArchives = 0;
      }
    });
    this.subscriptions.push(countSub);
  }

  /**
   * ✅ Navigation vers les archives avec actualisation du compteur
   */
  navigateToArchives(): void {
    this.router.navigate(['/archives']);
    // Actualiser le compteur après navigation
    setTimeout(() => this.loadArchiveCount(), 100);
  }

  /**
   * ✅ Navigation vers les dossiers actifs avec actualisation du compteur
   */
  navigateToDossiers(): void {
    this.router.navigate(['/dossiers']);
    // Actualiser le compteur après navigation
    setTimeout(() => this.loadArchiveCount(), 100);
  }

  /**
   * ✅ Méthode publique pour actualiser le compteur (à appeler depuis d'autres composants)
   */
  refreshArchiveCount(): void {
    this.loadArchiveCount();
  }


}
