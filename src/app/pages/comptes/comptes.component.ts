import { Component, OnInit } from '@angular/core';
import { CompteService } from '../../services/compte.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-comptes',
  templateUrl: './comptes.component.html',
  styleUrls: ['./comptes.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ComptesComponent implements OnInit {
  comptes: any[] = [];
  searchNomCompte: string = '';
  searchNom: string = '';
  searchPrenom: string = '';
  searchNNI: number | null = null;
  selectedFile: File | null = null;
  importMessage: { type: 'success' | 'error', text: string } | null = null;
  editingCompte: any = null;

  constructor(private compteService: CompteService) { }

  ngOnInit() {
    this.loadComptes();
  }

  loadComptes() {
    this.compteService.getAllComptes().subscribe({
      next: (data) => {
        this.comptes = data;
        console.log('Comptes chargés:', data);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des comptes:', error);
        this.importMessage = {
          type: 'error',
          text: error.message
        };
      }
    });
  }

  searchComptes() {
    this.compteService.searchComptes(
      this.searchNomCompte, 
      this.searchNom, 
      this.searchPrenom, 
      this.searchNNI || undefined
    ).subscribe({
      next: (data) => {
        this.comptes = data;
      },
      error: (error) => {
        console.error('Erreur lors de la recherche:', error);
        this.importMessage = {
          type: 'error',
          text: error.message
        };
      }
    });
  }

  startEdit(compte: any) {
    this.editingCompte = { ...compte };
  }

  cancelEdit() {
    this.editingCompte = null;
  }

  updateCompte(compte: any) {
    this.compteService.updateCompte(compte.nomCompte, {
      solde: compte.solde,
      etat: compte.etat
    }).subscribe({
      next: (response) => {
        console.log('Compte mis à jour:', response);
        this.loadComptes();
        this.editingCompte = null;
        this.importMessage = {
          type: 'success',
          text: 'Compte mis à jour avec succès'
        };
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour:', error);
        this.importMessage = {
          type: 'error',
          text: error.message
        };
      }
    });
  }

  deleteCompte(nomCompte: string) {
    if(confirm('Êtes-vous sûr de vouloir supprimer ce compte ?')) {
      this.compteService.deleteCompte(nomCompte).subscribe({
        next: (response) => {
          this.loadComptes();
          this.importMessage = {
            type: 'success',
            text: 'Compte supprimé avec succès'
          };
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.importMessage = {
            type: 'error',
            text: error.message
          };
        }
      });
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    this.importMessage = null;
  }

  uploadFile() {
    if (this.selectedFile) {
      this.importMessage = null;
      this.compteService.importComptes(this.selectedFile).subscribe({
        next: (response) => {
          console.log('Réponse import:', response);
          this.importMessage = {
            type: 'success',
            text: `Import réussi: ${response.count || 0} comptes importés`
          };
          this.loadComptes();
          this.selectedFile = null;
          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
        },
        error: (error) => {
          console.error('Erreur import:', error);
          this.importMessage = {
            type: 'error',
            text: error.message
          };
        }
      });
    } else {
      this.importMessage = {
        type: 'error',
        text: 'Veuillez sélectionner un fichier'
      };
    }
  }
}