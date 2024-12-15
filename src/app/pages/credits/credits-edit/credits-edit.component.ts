import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CreditService } from '../../../shared/services/credit.service';
import { CreditRoleService } from '../../../shared/services/credit-role.service';

@Component({
  selector: 'app-credit-edit',
  templateUrl: './credits-edit.component.html',
  styleUrls: ['./credits-edit.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CreditEditComponent implements OnInit {
  creditId!: number;
  credit: any = {};
  files: { [key: string]: File } = {};
  isLoading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private creditService: CreditService,
    public creditRoleService: CreditRoleService
  ) {}

  ngOnInit(): void {
    if (!this.creditRoleService.hasRole(['DO', 'DC'])) {
      this.router.navigate(['/credits']);
      return;
    }

    this.route.params.subscribe(params => {
      this.creditId = +params['id'];
      this.loadCreditDetails();
    });
  }

  loadCreditDetails() {
    this.isLoading = true;
    this.creditService.getCreditsDetails(this.creditId).subscribe({
      next: (data) => {
        this.credit = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading credit details:', error);
        this.errorMessage = 'Erreur lors du chargement des détails du crédit';
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: any, fileType: string) {
    const file = event.target.files[0];
    if (file) {
      this.files[fileType] = file;
    }
  }

  getFileName(fileType: string): string {
    return this.files[fileType]?.name || 'Aucun fichier sélectionné';
  }

  updateCredit() {
    this.isLoading = true;
    this.errorMessage = '';

    const formData = new FormData();

    // Add credit data
    formData.append(
      'credit',
      JSON.stringify({
        idCompte: this.credit.idCompte,
        idGarantie: this.credit.idGarantie,
        montant: this.credit.montant,
        tauxInteret: this.credit.tauxInteret,
        duree: this.credit.duree,
        dateDebut: this.credit.dateDebut,
        statut: this.credit.statut,
        refTransaction: this.credit.refTransaction
      })
    );

    // Add files if they exist
    Object.entries(this.files).forEach(([key, file]) => {
      formData.append(key, file);
    });

    this.creditService.updateCredit(this.creditId, formData).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/credits']);
      },
      error: (error) => {
        console.error('Error updating credit:', error);
        this.errorMessage = 'Erreur lors de la mise à jour du crédit';
        this.isLoading = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/credits']);
  }

  removeFile(fileType: string) {
    delete this.files[fileType];
  }
}