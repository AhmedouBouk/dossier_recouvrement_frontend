import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DossierRecouvrementService } from 'src/app/shared/services/dossier-recouvrement.service';
import { RoleService } from 'src/app/shared/services/role.service';
import { DossierRecouvrement, DossierStatus, EtatValidation } from 'src/app/shared/models/dossier-recouvrement.model';

@Component({
  selector: 'app-dossier-recouvrement-edit',
  templateUrl: './dossier-recouvrement-edit.component.html',
  styleUrls: ['./dossier-recouvrement-edit.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class DossierRecouvrementEditComponent implements OnInit {
  dossierId!: number;
  dossier: DossierRecouvrement = {
      id: 0,
      compte: {
          nomCompte: ''
      },
      engagementTotal: 0,
      montantPrincipal: 0,
      interetContractuel: 0,
      interetRetard: 0,
      naturesEngagement: [] as string[],
      agenceOuvertureCompte: '',
      referencesChecks: '',
      referencesCredits: '',
      referencesCautions: '',
      referencesLC: '',
      provision: 0,
      garantiesValeur: 0,
      status: DossierStatus.EN_COURS,
      etatValidation: EtatValidation.INITIALE,
      interetsReserves: 0,
      garantiesTitre: '',
      garantiesFile: '',
      creditsFile: '',
      cautionsFile: '',
      lcFile: '',
      chequeFile: '',
      dateCreation: new Date() // Initialisé avec la date actuelle
    };
  isLoading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dossierService: DossierRecouvrementService,
    public roleService: RoleService
  ) {}

  ngOnInit(): void {
   

    this.route.params.subscribe(params => {
      this.dossierId = +params['id'];
      this.loadDossierDetails();
    });
  }

  loadDossierDetails() {
    this.isLoading = true;
    this.dossierService.getDossierById(this.dossierId).subscribe({
      next: (data) => {
        this.dossier = {
          id: data.id,
          compte: data.compte,
          engagementTotal: data.engagementTotal,
          montantPrincipal: data.montantPrincipal,
          interetContractuel: data.interetContractuel,
          interetRetard: data.interetRetard,
          naturesEngagement: data.naturesEngagement,
          agenceOuvertureCompte: data.agenceOuvertureCompte,
          referencesChecks: data.referencesChecks,
          referencesCredits: data.referencesCredits,
          referencesCautions: data.referencesCautions,
          referencesLC: data.referencesLC,
          provision: data.provision,
          garantiesValeur: data.garantiesValeur,
          status: data.status,
          etatValidation: data.etatValidation,
          interetsReserves: data.interetsReserves,
          garantiesTitre: data.garantiesTitre,
          garantiesFile: data.garantiesFile,
          creditsFile: data.creditsFile,
          cautionsFile: data.cautionsFile,
          lcFile: data.lcFile,
          chequeFile: data.chequeFile,
          dateCreation:data.dateCreation
        };
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dossier details:', error);
        this.errorMessage = 'Erreur lors du chargement des détails du dossier';
        this.isLoading = false;
      }
    });
  }

  updateDossier() {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.dossierService.updateDossier(this.dossierId, this.dossier).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dossiers']);
      },
      error: (error) => {
        console.error('Error updating dossier:', error);
        this.errorMessage = 'Erreur lors de la mise à jour du dossier';
        if (error.error === 'Account not found') {
          this.errorMessage = 'Le numéro de compte spécifié n\'existe pas';
        }
        this.isLoading = false;
      }
    });
  }

  validateForm(): boolean {
    if (!this.dossier.compte.nomCompte) {
      this.errorMessage = 'Le numéro de compte est obligatoire';
      return false;
    }
    if (this.dossier.engagementTotal <= 0) {
      this.errorMessage = 'L\'engagement total doit être supérieur à 0';
      return false;
    }
    if (this.dossier.montantPrincipal <= 0) {
      this.errorMessage = 'Le montant principal doit être supérieur à 0';
      return false;
    }
    if (!this.dossier.naturesEngagement) {
      this.errorMessage = 'Les origines de l\'engagement sont obligatoires';
      return false;
    }
    if (!this.dossier.agenceOuvertureCompte) {
      this.errorMessage = 'L\'agence d\'ouverture est obligatoire';
      return false;
    }
    return true;
  }

  cancel() {
    this.router.navigate(['/dossiers']);
  }
}