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

  onFileSelected(event: any, fileType: string) {
    const file = event.target.files[0];
    if (file) {
      this.files[fileType] = file;
    }
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
}