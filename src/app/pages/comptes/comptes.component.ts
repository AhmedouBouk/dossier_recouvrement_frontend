import { Component, OnInit, OnDestroy } from '@angular/core';
import { CompteService } from '../../shared/services/compte.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoleService } from '../../shared/services/role.service';
import { RouterModule } from '@angular/router'; // Import de RouterModule
import { Subject, debounceTime, distinctUntilChanged, Subscription } from 'rxjs';

@Component({
  selector: 'app-comptes',
  templateUrl: './comptes.component.html',
  styleUrls: ['./comptes.component.css'],
  standalone: true,

  imports: [CommonModule, FormsModule,RouterModule]
})
export class ComptesComponent implements OnInit, OnDestroy {
  comptes: any[] = [];
  searchNomCompte: string = '';
  searchNom: string = '';
  searchPrenom: string = '';
  searchNNI: number | null = null;
  globalSearch: string = '';
  showNoResultsMessage: boolean = false;
  selectedFile: File | null = null;
  importMessage: { type: 'success' | 'error' | 'warning', text: string } | null = null;
  editingCompte: any = null;

  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription | undefined;

  constructor(private compteService: CompteService,
    public roleService: RoleService
  ) { }

  ngOnInit() {
    this.setupSearch();
    this.searchComptes(); // Initial load
  }

  ngOnDestroy() {
    this.searchSubscription?.unsubscribe();
  }

  setupSearch() {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300), // Wait for 300ms after the last keystroke
      distinctUntilChanged() // Only emit if the search term has changed
    ).subscribe(searchTerm => {
      this.searchComptes(searchTerm);
    });
  }

  onSearchInputChange(event: any) {
    this.searchSubject.next(event.target.value);
  }

  loadComptes() {
    this.showNoResultsMessage = false;
    this.globalSearch = '';
    
    this.compteService.getAllComptes().subscribe({
      next: (data) => {
        this.comptes = data;
        if (data.length === 0) {
          this.importMessage = {
            type: 'warning',
            text: 'Aucun compte trouvé dans la base de données.'
          };
        }
      },
      error: (error) => {
        this.importMessage = {
          type: 'error',
          text: error.message
        };
      }
    });
  }
  getAlertIcon(type: 'success' | 'error' | 'warning'): string {
    const iconMap: Record<'success' | 'error' | 'warning', string> = {
      'success': 'check_circle',
      'error': 'error',
      'warning': 'warning'
    };
    return iconMap[type];
  }

  searchComptes(searchTerm: string = this.globalSearch) {
    console.log('searchComptes called with searchTerm:', searchTerm);
    this.showNoResultsMessage = false;

    // If search term is empty, load all comptes
    if (!searchTerm) {
      this.compteService.getAllComptes().subscribe({
        next: (data) => {
          console.log('Loaded all comptes:', data);
          this.comptes = data;
          if (data.length === 0) {
            this.importMessage = {
              type: 'warning',
              text: 'Aucun compte trouvé dans la base de données.'
            };
          } else {
             this.importMessage = null;
          }
        },
        error: (error) => {
          console.error('Error loading all comptes:', error);
          this.importMessage = {
            type: 'error',
            text: error.message
          };
          this.comptes = []; // Clear results on error
        }
      });
    } else {
      // Perform search if search term is not empty
      this.compteService.searchComptes(
        '',
        '',
        '',
        undefined,
        searchTerm
      ).subscribe({
        next: (data) => {
          console.log('API response data for search:', data);
          this.comptes = data;
          if (data.length === 0) {
            console.log('No results found for search term:', searchTerm);
            this.showNoResultsMessage = true;
          } else {
             this.showNoResultsMessage = false;
          }
          this.importMessage = null; // Clear import message on successful search
        },
        error: (error) => {
          console.error('Error during search:', error);
          this.importMessage = {
            type: 'error',
            text: error.message
          };
          this.comptes = []; // Clear results on error
          this.showNoResultsMessage = true; // Show no results message on error
        }
      });
    }
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
        this.searchComptes();
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
          this.searchComptes();
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
          this.searchComptes();
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