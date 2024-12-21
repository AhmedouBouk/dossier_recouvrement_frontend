import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CreditRoleService } from '../../../shared/services/credit-role.service';
import { CreditService } from 'src/app/shared/services/credit.service';

@Component({
  selector: 'app-credit-edit',
  templateUrl: './credits-edit.component.html',
  styleUrls: ['./credits-edit.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CreditEditComponent implements OnInit {
  creditId!: number;
  credit: any = {
    idCompte: '',
    idGarantie: '',
    montant: 0,
    tauxInteret: 0,
    duree: 0,
    dateDebut: '',
    statut: '',
    refTransaction: ''
  };
  files: { [key: string]: File } = {};
  isLoading = false;
  errorMessage = '';

  documentTypes = [
    'demande',
    'etude',
    'bulletinSalaire',
    'domiciliation',
    'pvComite',
    'bonPourAval',
    'reconnaissanceDeDette',
    'contrat',
    'tableauAmortissement'
  ];

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
        console.log('Credit details received:', data);
        
        // Format the date for the input field
        if (data.dateDebut) {
          const date = new Date(data.dateDebut);
          data.dateDebut = date.toISOString().split('T')[0];
        }

        this.credit = {
          idCompte: data.idCompte || '',
          idGarantie: data.idGarantie || '',
          montant: data.montant || 0,
          tauxInteret: data.tauxInteret || 0,
          duree: data.duree || 0,
          dateDebut: data.dateDebut || '',
          statut: data.statut || 'En attente',
          refTransaction: data.refTransaction || ''
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

  onFileSelected(event: any, fileType: string) {
    const file = event.target.files[0];
    if (file) {
      this.files[fileType] = file;
    }
  }

  getFileName(fileType: string): string {
    return this.files[fileType]?.name || 'Choisir un fichier';
  }

  updateCredit() {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formData = new FormData();
    const creditData = {
      idCompte: this.credit.idCompte,
      idGarantie: this.credit.idGarantie,
      montant: this.credit.montant,
      tauxInteret: this.credit.tauxInteret,
      duree: this.credit.duree,
      dateDebut: this.credit.dateDebut,
      statut: this.credit.statut,
      refTransaction: this.credit.refTransaction
    };

    // Add credit data
    formData.append('credit', JSON.stringify(creditData));

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

  validateForm(): boolean {
    if (!this.credit.idCompte || !this.credit.idGarantie) {
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

  removeFile(fileType: string) {
    delete this.files[fileType];
  }

  getDocumentIcon(docType: string): string {
    const iconMap: { [key: string]: string } = {
      'demande': 'description',
      'etude': 'analytics',
      'bulletinSalaire': 'receipt_long',
      'domiciliation': 'home',
      'pvComite': 'groups',
      'bonPourAval': 'verified',
      'reconnaissanceDeDette': 'gavel',
      'contrat': 'assignment',
      'tableauAmortissement': 'table_chart'
    };
    return iconMap[docType] || 'file_present';
  }

  getDocumentLabel(docType: string): string {
    const labelMap: { [key: string]: string } = {
      'demande': 'Demande',
      'etude': 'Étude',
      'bulletinSalaire': 'Bulletin de Salaire',
      'domiciliation': 'Domiciliation',
      'pvComite': 'PV Comité',
      'bonPourAval': 'Bon Pour Aval',
      'reconnaissanceDeDette': 'Reconnaissance de Dette',
      'contrat': 'Contrat',
      'tableauAmortissement': 'Tableau d\'Amortissement'
    };
    return labelMap[docType] || docType;
  }
}