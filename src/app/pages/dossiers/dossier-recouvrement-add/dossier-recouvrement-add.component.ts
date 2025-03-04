import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RoleService } from '../../../shared/services/role.service';
import { DossierRecouvrementService } from 'src/app/shared/services/dossier-recouvrement.service';
import { DossierRecouvrement, DossierStatus, EtatValidation } from 'src/app/shared/models/dossier-recouvrement.model';

@Component({
  selector: 'app-dossier-recouvrement-add',
  templateUrl: './dossier-recouvrement-add.component.html',
  styleUrls: ['./dossier-recouvrement-add.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class DossierRecouvrementAddComponent implements OnInit {
  dossierForm: DossierRecouvrement = {
    idDossier: 0,
    compte: {
      nomCompte: ''
    },
    engagementTotal: 0,
    montantPrincipal: 0,
    interetContractuel: 0,
    interetRetard: 0,
    naturesEngagement: [],
    agenceOuvertureCompte: '',
    referencesChecks: '',
    referencesCredits: '',
    referencesCautions: '',
    referencesLC: '',
    provision: 0,
    interetsReserves: 0,
    garantiesValeur: 0,
    garantiesTitre: '',
    garantiesFile: '',
    creditsFile: '',
    cautionsFile: '',
    lcFile: '',
    chequeFile: '',
    status: DossierStatus.EN_COURS,
    etatValidation: EtatValidation.INITIALE
  };

  isLoading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private dossierService: DossierRecouvrementService,
    public roleService: RoleService
  ) {}

  ngOnInit(): void {
    
  }

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
    if (!this.dossierForm.naturesEngagement || this.dossierForm.naturesEngagement.length === 0) {
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