import { Component, OnInit } from '@angular/core';
import { RejetService, Rejet } from '../../../shared/services/rejet.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-rejet-list',
  templateUrl: './rejet-list.component.html',
  styleUrls: ['./rejet-list.component.css']
})
export class RejetListComponent implements OnInit {
  rejets: Rejet[] = [];
  loading = true;
  error: string | null = null;
  searchTerm = '';
  
  constructor(
    private rejetService: RejetService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRejets();
  }

  loadRejets(): void {
    this.loading = true;
    this.error = null;
    
    this.rejetService.getAllRejets()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => {
          this.rejets = data;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des rejets', err);
          this.error = 'Impossible de charger les motifs de rejet. Veuillez réessayer plus tard.';
        }
      });
  }

  viewDossier(dossierId: number): void {
    this.router.navigate(['/dossiers', dossierId]);
  }

  marquerCommeTraite(rejet: Rejet, event: Event): void {
    event.stopPropagation(); // Empêcher la navigation vers le dossier
    
    if (rejet.traite) return;
    
    // Récupérer l'ID du dossier associé au rejet
    const dossierId = rejet.dossier?.id;
    
    this.rejetService.marquerRejetCommeTraite(rejet.id, dossierId)
      .subscribe({
        next: (updatedRejet) => {
          // Mettre à jour le rejet dans la liste
          const index = this.rejets.findIndex(r => r.id === rejet.id);
          if (index !== -1) {
            this.rejets[index] = updatedRejet;
          }
        },
        error: (err: Error) => {
          console.error('Erreur lors du traitement du rejet', err);
        }
      });
  }

  get filteredRejets(): Rejet[] {
    if (!this.searchTerm.trim()) {
      return this.rejets;
    }
    
    const searchTermLower = this.searchTerm.toLowerCase();
    return this.rejets.filter(rejet => 
      rejet.motif.toLowerCase().includes(searchTermLower) ||
      rejet.rejetePar.name.toLowerCase().includes(searchTermLower) ||
      rejet.dossier?.id.toString().includes(searchTermLower)
    );
  }
}
