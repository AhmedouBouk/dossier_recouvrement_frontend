import { Component, OnInit, OnDestroy } from '@angular/core';
import { ClientService } from '../../shared/services/client.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoleService } from '../../shared/services/role.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, debounceTime, distinctUntilChanged, Subscription } from 'rxjs';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ClientsComponent implements OnInit, OnDestroy {
  clients: any[] = [];
  selectedFile: File | null = null;
  globalSearch: string = '';
  showNoResultsMessage: boolean = false;
  importMessage: { type: 'success' | 'error' | 'warning', text: string } | null = null;
  editingClient: any = null;
  isLoading = false;
  
  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription | undefined;

  constructor(
    private clientService: ClientService,
    public roleService: RoleService
  ) { }

  ngOnInit() {
    this.setupSearch();
    this.searchClients(); // Initial load
  }

  ngOnDestroy() {
    this.searchSubscription?.unsubscribe();
  }

  setupSearch() {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchClients(searchTerm);
    });
  }

  onSearchInputChange(event: any) {
    this.searchSubject.next(event.target.value);
  }

  handleError(error: HttpErrorResponse): string {
    if (error.error instanceof ErrorEvent) {
      return 'Problème de connexion. Vérifiez votre connexion internet et réessayez.';
    }

    switch (error.status) {
      case 400:
        if (typeof error.error === 'string' && error.error.includes('duplicate')) {
          return 'Ce client existe déjà dans la base de données.';
        }
        return 'Les données saisies ne sont pas valides. Veuillez vérifier vos informations.';
      
      case 401:
        return 'Session expirée. Veuillez vous reconnecter.';
      
      case 403:
        return 'Vous n\'avez pas les permissions nécessaires pour cette action.';
      
      case 404:
        return 'Client non trouvé. Il a peut-être été supprimé.';
      
      case 409:
        return 'Cette opération crée un conflit avec les données existantes.';
      
      case 422:
        return 'Les informations fournies sont incomplètes ou invalides.';
      
      case 500:
        return 'Une erreur est survenue sur le serveur. Veuillez réessayer plus tard.';
      
      default:
        return 'Une erreur inattendue est survenue. Veuillez réessayer.';
    }
  }

  showMessage(type: 'success' | 'error' | 'warning', text: string, duration: number = 5000) {
    this.importMessage = { type, text };
    
    if (type !== 'error') {
      setTimeout(() => {
        if (this.importMessage?.text === text) {
          this.importMessage = null;
        }
      }, duration);
    }
  }

  validateFile(file: File): boolean {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.showMessage('warning', 'Le fichier est trop volumineux. La taille maximum est de 5 MB.');
      return false;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.showMessage('warning', 'Seuls les fichiers CSV sont acceptés.');
      return false;
    }

    return true;
  }

  importClients() {
    if (!this.selectedFile) {
      this.showMessage('warning', 'Veuillez sélectionner un fichier CSV.');
      return;
    }

    if (!this.roleService.hasImportClientPermission()) {
      this.showMessage('error', 'Vous n\'avez pas les permissions nécessaires.');
      return;
    }

    this.isLoading = true;
    this.importMessage = null;

    this.clientService.importClients(this.selectedFile).subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.showMessage('success', 'Import réussi ! Les clients ont été ajoutés.');
          this.searchClients();
          this.selectedFile = null;
          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
        } else {
          this.showMessage('error', 'L\'import a échoué. Veuillez réessayer.');
        }
      },
      error: (error) => {
        this.showMessage('error', this.handleError(error));
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  searchClients(searchTerm: string = this.globalSearch) {
    console.log('searchClients called with searchTerm:', searchTerm);
    this.isLoading = true;
    this.showNoResultsMessage = false;

    // If search term is empty, load all clients
    if (!searchTerm) {
      this.clientService.getAllClients().subscribe({
        next: (data) => {
          console.log('Loaded all clients:', data);
          this.clients = data;
          if (data.length === 0) {
             this.showMessage('warning', 'Aucun client trouvé dans la base de données.');
          }
        },
        error: (error) => {
          console.error('Error loading all clients:', error);
          this.showMessage('error', this.handleError(error));
          this.clients = [];
        },
        complete: () => {
           console.log('Loading all clients complete.');
           this.isLoading = false;
        }
      });
    } else {
      // Perform search if search term is not empty
      this.clientService.searchClients(
        '', 
        '', 
        undefined,
        searchTerm
      ).subscribe({
        next: (data) => {
          console.log('API response data for search:', data);
          this.clients = data;
          if (data.length === 0) {
            console.log('No results found for search term:', searchTerm);
            this.showNoResultsMessage = true;
          } else {
             this.showNoResultsMessage = false;
          }
        },
        error: (error) => {
          console.error('Error during search:', error);
          this.showMessage('error', this.handleError(error));
          this.clients = [];
          this.showNoResultsMessage = true;
        },
        complete: () => {
          console.log('Search complete.');
          this.isLoading = false;
        }
      });
    }
  }

  startEdit(client: any) {
    if (this.roleService.hasUpdateClientPermission()) {
      this.editingClient = { ...client };
    } else {
      this.showMessage('warning', 'Vous n\'avez pas les permissions pour modifier un client.');
    }
  }

  cancelEdit() {
    this.editingClient = null;
    this.importMessage = null;
  }

  validateClientData(client: any): boolean {
    if (!client.nom || client.nom.trim().length === 0) {
      this.showMessage('warning', 'Le nom du client est obligatoire.');
      return false;
    }

    if (!client.prenom || client.prenom.trim().length === 0) {
      this.showMessage('warning', 'Le prénom du client est obligatoire.');
      return false;
    }

    if (client.salaire && client.salaire < 0) {
      this.showMessage('warning', 'Le salaire ne peut pas être négatif.');
      return false;
    }

    return true;
  }

  updateClient() {
    if (!this.editingClient) return;

    if (!this.roleService.hasUpdateClientPermission()) {
      this.showMessage('error', 'Vous n\'avez pas les permissions nécessaires.');
      return;
    }

    if (!this.validateClientData(this.editingClient)) {
      return;
    }

    this.isLoading = true;

    this.clientService.updateClient(this.editingClient.nni, this.editingClient).subscribe({
      next: () => {
        this.showMessage('success', 'Client mis à jour avec succès !');
        this.searchClients();
        this.editingClient = null;
      },
      error: (error) => {
        this.showMessage('error', this.handleError(error));
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  deleteClient(nni: number) {
    if (!this.roleService.hasDeleteClientPermission()) {
      this.showMessage('error', 'Vous n\'avez pas les permissions nécessaires.');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.')) {
      return;
    }

    this.isLoading = true;

    this.clientService.deleteClient(nni).subscribe({
      next: () => {
        this.showMessage('success', 'Client supprimé avec succès !');
        this.searchClients();
      },
      error: (error) => {
        this.showMessage('error', this.handleError(error));
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
      console.log('Fichier sélectionné:', this.selectedFile.name);
    }
  }
}