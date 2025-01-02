import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CreditService } from 'src/app/shared/services/credit.service';
import { Credit } from 'src/app/shared/models/credit.model';

@Component({
  selector: 'app-credit-details',
  templateUrl: './credit-details.component.html',
  styleUrls: ['./credit-details.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class CreditDetailsComponent implements OnInit {
  creditDetails: Credit | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private creditService: CreditService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const creditId = params['id'];
      if (creditId) {
        this.loadCreditDetails(creditId);
      }
    });
  }

  loadCreditDetails(creditId: number) {
    this.creditService.getCreditDetails(creditId).subscribe({
      next: (details) => this.creditDetails = details,
      error: (err) => {
        console.error('Erreur de récupération des détails', err);
        this.router.navigate(['/credits']);
      }
    });
  }

  goBack() {
    this.router.navigate(['/credits']);
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'En cours': 'active',
      'En attente': 'pending',
      'Clôturé': 'closed',
      'Approuvé': 'active',
      'Refusé': 'closed',
      'En traitement': 'pending'
    };
    
    return statusMap[status] || 'pending';
  }
}