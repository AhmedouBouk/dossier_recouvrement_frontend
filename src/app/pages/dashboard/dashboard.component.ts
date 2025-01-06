import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../shared/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats: any = {}; // Stocke les données statistiques
  isLoading = true; // Affiche un indicateur de chargement
  error: string | null = null; // Stocke les messages d'erreur éventuels

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardStats();
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
}
