import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DossierRecouvrementService } from 'src/app/shared/services/dossier-recouvrement.service';
import { RoleService } from 'src/app/shared/services/role.service';
import { DossierRecouvrement, EtatValidation } from 'src/app/shared/models/dossier-recouvrement.model';

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
    accountNumber: '',
    // nomClientRecouvrement is now optional
    compte: { nomCompte: '' },
    engagementTotal: 0,
    montantPrincipal: 0,
    interetContractuel: 0,
    interetRetard: 0,
    naturesEngagement: [],
    agenceOuvertureCompte: '',
    // Removed fields that don't exist in backend entity
    // dateOuvertureCompte: new Date(),
    // situationCompte: '',
    // situationJuridique: '',
    // typeClient: '',
    // natureEngagement: '',
    // natureCredit: '',
    // typeGarantie: '',
    // periodiciteRemboursement: '',
    // dateEcheanceInitiale: new Date(),
    // dateSituation: new Date(),
    dateCreation: new Date(),
    status: '',
    etatValidation: EtatValidation.INITIALE,
    interetsReserves: 0,
    garantiesValeur: 0,
    garantiesTitre: '',
    creditsFile: '',
    cautionsFile: '',
    lcFile: '',
    chequeFiles: [],
    referencesChecks: '',
    referencesCredits: '',
    referencesCautions: '',
    referencesLC: '',
    provision: 0
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
          accountNumber: data.accountNumber || '',
          // nomClientRecouvrement removed as it doesn't exist in backend entity
          compte: data.compte,
          engagementTotal: data.engagementTotal,
          montantPrincipal: data.montantPrincipal,
          interetContractuel: data.interetContractuel,
          interetRetard: data.interetRetard,
          naturesEngagement: [],  
          agenceOuvertureCompte: data.agenceOuvertureCompte,
          dateCreation: data.dateCreation,
          status: data.status || '',
          etatValidation: data.etatValidation,
          referencesChecks: data.referencesChecks || '',
          referencesCredits: data.referencesCredits || '',
          referencesCautions: data.referencesCautions || '',
          referencesLC: data.referencesLC || '',
          provision: data.provision || 0,
          interetsReserves: data.interetsReserves || 0,
          garantiesValeur: data.garantiesValeur,
          creditsFile: data.creditsFile || '',
          cautionsFile: data.cautionsFile || '',
          lcFile: data.lcFile || '',
          garanties: data.garanties || [],
          // Preserve all file arrays to prevent them from being lost during update
          creditFiles: data.creditFiles || [],
          cautionFiles: data.cautionFiles || [],
          chequeFiles: data.chequeFiles || [],
          lcFiles: data.lcFiles || []
        };
        
        // Handle naturesEngagement separately to avoid TypeScript errors
        if (data.naturesEngagement) {
          if (typeof data.naturesEngagement === 'string') {
            // Use explicit casting to string to fix TypeScript error
            this.dossier.naturesEngagement = (data.naturesEngagement as string).split(',');
          } else if (Array.isArray(data.naturesEngagement)) {
            this.dossier.naturesEngagement = data.naturesEngagement;
          }
        }
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
    
    // Create a copy of the dossier to modify for sending to backend
    const dossierToUpdate: any = { ...this.dossier };
    
    // Convert naturesEngagement array to comma-separated string
    if (Array.isArray(dossierToUpdate.naturesEngagement)) {
      dossierToUpdate.naturesEngagement = dossierToUpdate.naturesEngagement.join(',');
    }

    this.dossierService.updateDossier(this.dossierId, dossierToUpdate).subscribe({
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