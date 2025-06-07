import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RoleService } from '../../../shared/services/role.service';
import { DossierRecouvrementService } from 'src/app/shared/services/dossier-recouvrement.service';
import { DossierRecouvrement, EtatValidation } from 'src/app/shared/models/dossier-recouvrement.model';

@Component({
  selector: 'app-dossier-recouvrement-add',
  templateUrl: './dossier-recouvrement-add.component.html',
  styleUrls: ['./dossier-recouvrement-add.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class DossierRecouvrementAddComponent {
  dossierForm: DossierRecouvrement = {
    id: 0,
    numeroDossierRecouvrement: '',
    nomClientRecouvrement: '',
    compte: {
      nomCompte: ''
    },
    engagementTotal: 0,
    montantPrincipal: 0,
    interetContractuel: 0,
    interetRetard: 0,
    naturesEngagement: [],
    agenceOuvertureCompte: '',
    dateOuvertureCompte: new Date(),
    situationCompte: '',
    situationJuridique: '',
    typeClient: '',
    natureEngagement: '',
    natureCredit: '',
    typeGarantie: '',
    periodiciteRemboursement: '',
    dateEcheanceInitiale: new Date(),
    dateSituation: new Date(),
    referencesChecks: '',
    referencesCredits: '',
    referencesCautions: '',
    referencesLC: '',
    provision: 0,
    interetsReserves: 0,
    creditsFile: '',
    cautionsFile: '',
    dateCreation: new Date(),
    status: '',
    etatValidation: EtatValidation.INITIALE,
    garanties: []
  };

  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly router: Router,
    private readonly dossierService: DossierRecouvrementService,
    private readonly roleService: RoleService
  ) {}



  addDossier() {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.dossierService.createDossier(this.dossierForm).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dossiers']);
      },
      error: (error) => {
        console.error('Error adding dossier:', error);
        this.errorMessage = 'Erreur lors de l\'ajout du dossier';
        if (error.error === 'Account not found') {
          this.errorMessage = 'Le numéro de compte spécifié n\'existe pas';
        }
        this.isLoading = false;
      }
    });
  }

  validateForm(): boolean {
    if (!this.dossierForm.compte.nomCompte) {
      this.errorMessage = 'Le numéro de compte est obligatoire';
      return false;
    }
    if (this.dossierForm.engagementTotal <= 0) {
      this.errorMessage = 'L\'engagement total doit être supérieur à 0';
      return false;
    }
    if (this.dossierForm.montantPrincipal <= 0) {
      this.errorMessage = 'Le montant principal doit être supérieur à 0';
      return false;
    }
    if (!this.dossierForm.natureEngagement || this.dossierForm.natureEngagement.length === 0) {
      this.errorMessage = 'Les natures de l\'engagement sont obligatoires';
      return false;
    }
    if (!this.dossierForm.agenceOuvertureCompte) {
      this.errorMessage = 'L\'agence d\'ouverture est obligatoire';
      return false;
    }
    return true;
  }

  cancel() {
    this.router.navigate(['/dossiers']);
  }
}