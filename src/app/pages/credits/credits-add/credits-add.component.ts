import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RoleService } from '../../../shared/services/role.service';
import { CreditService } from 'src/app/shared/services/credit.service';
import { CreditDTO } from 'src/app/shared/models/credit.model';

@Component({
  selector: 'app-credit-add',
  templateUrl: './credits-add.component.html',
  styleUrls: ['./credits-add.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CreditAddComponent implements OnInit {
  creditForm: CreditDTO = {
    idCompte: '',
    idGarantie: 0,
    montant: 0,
    tauxInteret: 0,
    duree: 0,
    dateDebut: '',
    statut: 'En attente',
    refTransaction: '',
    fondDossier: ''
  };

  isLoading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private creditService: CreditService,
    public roleService: RoleService
  ) {}

  ngOnInit(): void {
    if (!this.roleService.hasEditPermission()) {
      this.router.navigate(['/credits']);
      return;
    }
  }

  addCredit() {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.creditService.addCredit(this.creditForm).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/credits']);
      },
      error: (error) => {
        console.error('Error adding credit:', error);
        this.errorMessage = 'Erreur lors de l\'ajout du crédit';
        this.isLoading = false;
      }
    });
  }

  validateForm(): boolean {
    if (!this.creditForm.idCompte ) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      return false;
    }
    if (this.creditForm.montant <= 0) {
      this.errorMessage = 'Le montant doit être supérieur à 0';
      return false;
    }
    if (this.creditForm.tauxInteret < 0) {
      this.errorMessage = 'Le taux d\'intérêt ne peut pas être négatif';
      return false;
    }
    if (this.creditForm.duree <= 0) {
      this.errorMessage = 'La durée doit être supérieure à 0';
      return false;
    }
    return true;
  }

  cancel() {
    this.router.navigate(['/credits']);
  }
}