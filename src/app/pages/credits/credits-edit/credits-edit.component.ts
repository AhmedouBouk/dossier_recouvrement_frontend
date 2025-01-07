import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CreditService } from 'src/app/shared/services/credit.service';
import { RoleService } from 'src/app/shared/services/role.service';
import { CreditDTO } from 'src/app/shared/models/credit.model';

@Component({
  selector: 'app-credit-edit',
  templateUrl: './credits-edit.component.html',
  styleUrls: ['./credits-edit.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CreditEditComponent implements OnInit {
  creditId!: number;
  credit: CreditDTO = {
    idCompte: '',
    typeGarantie: '',
    valeurGarantie: 0,
    montant: 0,
    tauxInteret: 0,
    duree: 0,
    dateDebut: '',
    statut: '',
    refTransaction: '',
    fondDossier: ''
  };
  isLoading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private creditService: CreditService,
    public roleService: RoleService
  ) {}

  ngOnInit(): void {
    if (!this.roleService.hasEditPermission()) {
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
    this.creditService.getCreditDetails(this.creditId).subscribe({
      next: (data) => {
        console.log('Credit details received:', data);
        
        // Format the date for the input field
        if (data.dateDebut) {
          const date = new Date(data.dateDebut);
          data.dateDebut = date.toISOString().split('T')[0];
        }

        this.credit = {
          idCompte: data.compte.nomCompte,
          typeGarantie: data.typeGarantie,
          valeurGarantie: data.valeurGarantie,
          montant: data.montant,
          tauxInteret: data.tauxInteret,
          duree: data.duree,
          dateDebut: data.dateDebut,
          statut: data.statut,
          refTransaction: data.refTransaction,
          fondDossier: data.fondDossier
        };

        console.log('Formatted credit data:', this.credit);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading credit details:', error);
        this.errorMessage = 'Erreur lors du chargement des détails du crédit';
        this.isLoading = false;
      }
    });
  }

  updateCredit() {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.creditService.updateCredit(this.creditId, this.credit).subscribe({
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

  validateForm(): boolean {
    if (!this.credit.idCompte) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      return false;
    }
    if (this.credit.montant <= 0) {
      this.errorMessage = 'Le montant doit être supérieur à 0';
      return false;
    }
    if (this.credit.tauxInteret < 0) {
      this.errorMessage = 'Le taux d\'intérêt ne peut pas être négatif';
      return false;
    }
    if (this.credit.duree <= 0) {
      this.errorMessage = 'La durée doit être supérieure à 0';
      return false;
    }
    return true;
  }

  cancel() {
    this.router.navigate(['/credits']);
  }
  
  
}