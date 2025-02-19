import { Component, OnInit } from '@angular/core';
import { CompteService } from '../../shared/services/compte.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoleService } from '../../shared/services/role.service';
import { RouterModule } from '@angular/router'; // Import de RouterModule

@Component({
  selector: 'app-comptes',
  templateUrl: './comptes.component.html',
  styleUrls: ['./comptes.component.css'],
  standalone: true,

  imports: [CommonModule, FormsModule,RouterModule]
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

  constructor(private compteService: CompteService,
    public roleService: RoleService
  ) { }

  ngOnInit() {
    this.loadComptes();
  }

  loadComptes() {
    this.compteService.getAllComptes().subscribe({
      next: (data) => {
        this.comptes = data;
      },
      error: (error) => {
        this.importMessage = {
          type: 'error',
          text: error.message
        };
      }
    });
  }
  getAlertIcon(type: 'success' | 'error'): string {
    const iconMap: Record<'success' | 'error', string> = {
      'success': 'check_circle',
      'error': 'error'
    };
    return iconMap[type];
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
        this.loadComptes();
        this.editingCompte = null;
        this.importMessage = {
          type: 'success',
          text: 'Compte mis à jour avec succès'
        };
      },
      error: (error) => {
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
  getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'ACTIF': 'status-active',
      'BLOQUÉ': 'status-blocked',
      'FERMÉ': 'status-closed'
    };
    return statusMap[status] || 'status-default';
  }
  
}