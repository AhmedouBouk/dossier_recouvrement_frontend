import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreditService } from '../../shared/services/credit.service';
import { CommonModule } from '@angular/common';
import { CreditRoleService } from '../../shared/services/credit-role.service';

@Component({
  selector: 'app-credits',
  templateUrl: './credits.component.html',
  styleUrls: ['./credits.component.css'] ,
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CreditsComponent implements OnInit {
  creditRoleService: any;

  credits: any[] = [];
  selectedCredit: any = null;
  searchTerm: string = '';
  showAddForm: boolean = false;
  creditForm: any = {};
  editingCredit: any | null = null;
credit: any;


  constructor(private creditService: CreditService) {}

  ngOnInit(): void {
    this.loadCredits();
  }

  loadCredits() {
    this.creditService.getAllCredits().subscribe({
      next: (data) => (this.credits = data),
      error: (err) => console.error('Erreur de chargement', err)
    });
  }

  searchCredits() {
    if (this.searchTerm) {
      this.creditService.searchCredits(this.searchTerm).subscribe({
        next: (data) => (this.credits = data),
        error: (err) => console.error('Erreur de recherche', err)
      });
    } else {
      this.loadCredits();
    }
  }

  viewDetails(credit: any) {
    this.creditService.getCreditsDetails(credit.idCredit).subscribe({
      next: (details) => (this.selectedCredit = details),
      error: (err) => console.error('Erreur de récupération des détails', err)
    });
  }

  downloadFile(fileType: string) {
    if (this.selectedCredit) {
      this.creditService
        .downloadFile(this.selectedCredit.idCredit, fileType)
        .subscribe({
          next: (blob) => {
            const url = window.URL.createObjectURL(blob);
            window.open(url);
          },
          error: (err) => console.error('Erreur de téléchargement', err)
        });
    }
  }

  showAddCreditForm() {
    this.showAddForm = true;
    this.creditForm = {};
  }

  addCredit() {
    const formData = new FormData();
    Object.keys(this.creditForm).forEach((key) => {
      if (this.creditForm[key]) formData.append(key, this.creditForm[key]);
    });

    this.creditService.addCredit(formData).subscribe({
      next: () => {
        this.loadCredits();
        this.showAddForm = false;
      },
      error: (err) => console.error('Erreur d\'ajout', err)
    });
  }

  deleteCredit(creditId: number) {
    if (confirm('Confirmer la suppression ?')) {
      this.creditService.deleteCredit(creditId).subscribe({
        next: () => this.loadCredits(),
        error: (err) => console.error('Erreur de suppression', err)
      });
    }
  }
  
  startEdit(credit: any) {
    this.editingCredit = { ...credit };
  }

  cancelEdit() {
    this.editingCredit = null;
  }

  updateCredit(credit: any) {
    const updatedData: FormData = new FormData();
    updatedData.append('montant', credit.montant);
    updatedData.append('tauxInteret', credit.tauxInteret);
    updatedData.append('duree', credit.duree);
    updatedData.append('statut', credit.statut);
    updatedData.append('refTransaction', credit.refTransaction);
    updatedData.append('idCompte', credit.idCompte);
    updatedData.append('idGarantie', credit.idGarantie);
  
    // Ajoutez les fichiers seulement s'ils existent
    if (credit.demande) updatedData.append('demande', credit.demande);
    if (credit.etude) updatedData.append('etude', credit.etude);
    if (credit.bulletinSalaire) updatedData.append('bulletinSalaire', credit.bulletinSalaire);
    if (credit.domiciliation) updatedData.append('domiciliation', credit.domiciliation);
    if (credit.pvComite) updatedData.append('pvComite', credit.pvComite);
    if (credit.bonPourAval) updatedData.append('bonPourAval', credit.bonPourAval);
    if (credit.reconnaissanceDeDette) updatedData.append('reconnaissanceDeDette', credit.reconnaissanceDeDette);
    if (credit.contrat) updatedData.append('contrat', credit.contrat);
    if (credit.tableauAmortissement) updatedData.append('tableauAmortissement', credit.tableauAmortissement);
  
    this.creditService.updateCredit(credit.idCredit, updatedData).subscribe({
      next: (response) => {
        console.log('Crédit mis à jour:', response);
        this.loadCredits();
        this.editingCredit = null; // Réinitialiser le mode édition
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour:', error);
      }
    });
  }

  onFileSelected(event: any, fileType: string) {
    this.creditForm[fileType] = event.target.files[0];
  }

  hasDORole(): boolean {
    return this.creditRoleService.hasDORole();
  }
  hasDCRole(): boolean {
    return this.creditRoleService.hasDCRole();
  }

}
