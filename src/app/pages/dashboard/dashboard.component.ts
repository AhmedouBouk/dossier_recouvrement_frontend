import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardService, Notification } from '../../shared/services/dashboard.service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Stats du dashboard
  stats: any = {}; 
  isLoading = true;
  error: string | null = null;
  
  // Notifications
  notifications: Notification[] = [];
  isLoadingNotifications = true;
  unreadCount = 0;
  
  // Pour le rafraîchissement périodique
  private refreshSubscription: Subscription | null = null;

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Charger les statistiques du dashboard
    this.loadDashboardStats();
    
    // Charger les notifications
    this.loadNotifications();
    
    // Configurer un rafraîchissement périodique des notifications toutes les 60 secondes
    this.refreshSubscription = interval(60000).pipe(
      switchMap(() => this.dashboardService.getUserNotifications())
    ).subscribe({
      next: (data) => {
        this.notifications = data;
        this.calculateUnreadCount();
      },
      error: (err) => {
        console.error('Erreur lors du rafraîchissement des notifications:', err);
      }
    });
  }
  
  ngOnDestroy(): void {
    // Nettoyer l'abonnement de rafraîchissement
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  loadDashboardStats(): void {
    this.dashboardService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des statistiques :', err);
        this.error = 'Impossible de charger les données du tableau de bord.';
        this.isLoading = false;
      }
    });
  }
  
  loadNotifications(): void {
    this.isLoadingNotifications = true;
    this.dashboardService.getUserNotifications().subscribe({
      next: (data) => {
        this.notifications = data;
        this.calculateUnreadCount();
        this.isLoadingNotifications = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des notifications:', err);
        this.isLoadingNotifications = false;
      }
    });
  }
  
  calculateUnreadCount(): void {
    this.unreadCount = this.notifications.filter(notification => !notification.lu).length;
  }
  
  navigateToDossier(notification: Notification): void {
    if (notification.dossier && notification.dossier.id) {
      this.router.navigate(['/dossiers', notification.dossier.id]);
    }
  }
  
  markAsRead(notification: Notification): void {
    if (notification.id) {
      this.dashboardService.markNotificationAsRead(notification.id).subscribe({
        next: () => {
          notification.lu = true;
          this.calculateUnreadCount();
        },
        error: (err) => {
          console.error('Erreur lors du marquage de la notification comme lue:', err);
        }
      });
    }
  }
}