import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CreditService } from '../../../shared/services/credit.service';
import { CreditRoleService } from '../../../shared/services/credit-role.service';

@Component({
  selector: 'app-credit-add',
  templateUrl: './credits-add.component.html',
  styleUrls: ['./credits-add.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CreditAddComponent implements OnInit {
  creditForm = {
    idCompte: '',
    idGarantie: '',
    montant: null,
    tauxInteret: null,
    duree: null,
    dateDebut: '',
    statut: '',
    refTransaction: ''
  };

  files: { [key: string]: File } = {};
  isLoading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private creditService: CreditService,
    public creditRoleService: CreditRoleService
  ) {}

  ngOnInit(): void {
    if (!this.creditRoleService.hasRole(['DO'])) {
      this.router.navigate(['/credits']);
      return;
    }
  }
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


  onFileSelected(event: any, fileType: string) {
    const file = event.target.files[0];
    if (file) {
      this.files[fileType] = file;
    }
  }
  isAllFilesUploaded(): boolean {
    return this.documentTypes.every(docType => this.files[docType]);
  }
  getFileName(fileType: string): string {
    return this.files[fileType]?.name || 'Aucun fichier sélectionné';
  }

  removeFile(fileType: string) {
    delete this.files[fileType];
  }

  addCredit() {
    this.isLoading = true;
    this.errorMessage = '';

    const formData = new FormData();

    // Add credit data
    formData.append(
      'creditdto',
      JSON.stringify({
        idCompte: this.creditForm.idCompte,
        idGarantie: this.creditForm.idGarantie,
        montant: this.creditForm.montant,
        tauxInteret: this.creditForm.tauxInteret,
        duree: this.creditForm.duree,
        dateDebut: this.creditForm.dateDebut,
        statut: this.creditForm.statut,
        refTransaction: this.creditForm.refTransaction
      })
    );

    // Add files if they exist
    Object.entries(this.files).forEach(([key, file]) => {
      formData.append(key, file);
    });

    this.creditService.addCredit(formData).subscribe({
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

  cancel() {
    this.router.navigate(['/credits']);
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