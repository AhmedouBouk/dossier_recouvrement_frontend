import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DossierRecouvrementService } from 'src/app/shared/services/dossier-recouvrement.service';
import { DossierRecouvrement } from 'src/app/shared/models/dossier-recouvrement.model';

@Component({
  selector: 'app-dossier-recouvrement-details',
  templateUrl: './dossier-recouvrement-details.component.html',
  styleUrls: ['./dossier-recouvrement-details.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class DossierRecouvrementDetailsComponent implements OnInit {
  dossierDetails: DossierRecouvrement | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dossierService: DossierRecouvrementService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const dossierId = params['id'];
      if (dossierId) {
        this.loadDossierDetails(dossierId);
      }
    });
  }

  loadDossierDetails(dossierId: number) {
    this.dossierService.getDossierById(dossierId).subscribe({
      next: (details) => this.dossierDetails = details,
      error: (err) => {
        console.error('Erreur de récupération des détails', err);
        this.router.navigate(['/dossiers']);
      }
    });
  }

  goBack() {
    this.router.navigate(['/dossiers']);
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'En cours': 'active',
      'En attente': 'pending',
      'Clôturé': 'closed',
      'Initiale': 'pending',
      'Validé': 'active',
      'Non Validé': 'closed'
    };
    
    return statusMap[status] || 'pending';
  }
}