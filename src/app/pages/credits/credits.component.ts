import { Component, OnInit } from '@angular/core';
import { CreditService } from '../../shared/services/credit.service';
import { Credit } from '../../shared/models/credit.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-credits',
  templateUrl: './credits.component.html',
  styleUrls: ['./credits.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CreditsComponent implements OnInit {
editingCredit: any;
cancelEdit() {
throw new Error('Method not implemented.');
}
startEdit(_t23: Credit) {
throw new Error('Method not implemented.');
}
  credits: Credit[] = [];
  selectedCredit: Credit | null = null;
  newCredit: Partial<Credit> = {};
  searchNomCompte: string = '';
  files: { [key: string]: File | null } = {};
  editMode: boolean = false;
  importMessage: { type: 'success' | 'error', text: string } | null = null;

  constructor(private creditService: CreditService) {}

  ngOnInit() {
    this.loadCredits();
  }

  // Charger tous les crédits
  loadCredits() {
    this.creditService.getAllCredits().subscribe({
      next: (data) => {
        this.credits = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des crédits:', error);
      }
    });
  }

  // Rechercher des crédits par nom de compte
  searchCredits() {
    if (this.searchNomCompte) {
      this.creditService.searchCreditsByNomCompte(this.searchNomCompte).subscribe({
        next: (data) => {
          this.credits = data;
        },
        error: (error) => {
          console.error('Erreur lors de la recherche:', error);
        }
      });
    } else {
      this.loadCredits();
    }
  }

  // Ajouter un nouveau crédit
  addCredit() {
    this.creditService.createCredit(this.newCredit, this.files).subscribe({
      next: (data) => {
        console.log('Crédit créé:', data);
        this.loadCredits();
        this.newCredit = {};
        this.files = {};
      },
      error: (error) => {
        console.error('Erreur lors de la création du crédit:', error);
      }
    });
  }

  // Mettre à jour un crédit existant
  updateCredit() {
    if (this.selectedCredit) {
      this.creditService.updateCredit(this.selectedCredit.idCredit!, this.selectedCredit, this.files).subscribe({
        next: (data) => {
          console.log('Crédit mis à jour:', data);
          this.loadCredits();
          this.selectedCredit = null;
          this.editMode = false;
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour:', error);
        }
      });
    }
  }

  // Supprimer un crédit
  deleteCredit(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce crédit ?')) {
      this.creditService.deleteCredit(id).subscribe({
        next: (response) => {
          console.log('Crédit supprimé:', response);
          this.loadCredits();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
        }
      });
    }
  }

  // Télécharger tous les documents associés à un crédit
  downloadDocuments(id: number) {
    this.creditService.downloadAllDocuments(id).subscribe({
      next: (path) => {
        console.log('Documents téléchargés:', path);
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement des documents:', error);
      }
    });
  }

  // Gestion des fichiers
  onFileSelected(event: any, key: string) {
    this.files[key] = event.target.files[0];
  }
}
