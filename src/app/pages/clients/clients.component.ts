import { Component, OnInit, OnDestroy } from '@angular/core';
import { ClientService } from '../../shared/services/client.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoleService } from '../../shared/services/role.service';
import { HttpErrorResponse } from '@angular/common/http';

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
  searchNom: string = '';
  searchPrenom: string = '';
  searchNNI: number | null = null;
  importMessage: { type: 'success' | 'error' | 'warning', text: string } | null = null;
  editingClient: any = null;
  isLoading = false;
  private loadingTimeout: any;
  showReloadOption = false;
  loadingStartTime: number = 0;
  loadingDuration: string = '';

  constructor(
    private clientService: ClientService,
    public roleService: RoleService
  ) { }

  ngOnInit() {
    this.loadClients();
  }

  ngOnDestroy() {
    this.clearLoadingTimeout();
  }

  private startLoadingTimeout() {
    this.loadingStartTime = Date.now();
    this.showReloadOption = false;
    
    // Update loading duration every second
    const updateDuration = setInterval(() => {
      const seconds = Math.floor((Date.now() - this.loadingStartTime) / 1000);
      this.loadingDuration = `${seconds} secondes`;
    }, 1000);

    // Show reload option after 10 seconds
    this.loadingTimeout = setTimeout(() => {
      this.showReloadOption = true;
      clearInterval(updateDuration);
    }, 4000);
  }

  private clearLoadingTimeout() {
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
      this.loadingTimeout = null;
    }
    this.showReloadOption = false;
    this.loadingDuration = '';
  }

  reloadPage() {
    window.location.reload();
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

  onFileSelected(event: any) {
    if (this.roleService.hasEditPermission()) {
      const file = event.target.files[0];
      if (file && this.validateFile(file)) {
        this.selectedFile = file;
        this.importMessage = null;
      } else {
        event.target.value = '';
        this.selectedFile = null;
      }
    }
  }

  importClients() {
    if (!this.selectedFile) {
      this.showMessage('warning', 'Veuillez sélectionner un fichier CSV.');
      return;
    }

    if (!this.roleService.hasEditPermission()) {
      this.showMessage('error', 'Vous n\'avez pas les permissions nécessaires.');
      return;
    }

    this.isLoading = true;
    this.startLoadingTimeout();
    this.importMessage = null;

    this.clientService.importClients(this.selectedFile).subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.showMessage('success', 'Import réussi ! Les clients ont été ajoutés.');
          this.loadClients();
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
        this.clearLoadingTimeout();
      }
    });
  }

  loadClients() {
    this.isLoading = true;
    this.startLoadingTimeout();

    this.clientService.getAllClients().subscribe({
      next: (data) => {
        this.clients = data;
        if (data.length === 0) {
          this.showMessage('warning', 'Aucun client trouvé dans la base de données.');
        }
      },
      error: (error) => {
        this.showMessage('error', this.handleError(error));
      },
      complete: () => {
        this.isLoading = false;
        this.clearLoadingTimeout();
      }
    });
  }

  searchClients() {
    if (!this.searchNom && !this.searchPrenom && !this.searchNNI) {
      this.showMessage('warning', 'Veuillez saisir au moins un critère de recherche.');
      return;
    }

    this.isLoading = true;
    this.startLoadingTimeout();

    this.clientService.searchClients(
      this.searchNom, 
      this.searchPrenom, 
      this.searchNNI || undefined
    ).subscribe({
      next: (data) => {
        this.clients = data;
        if (data.length === 0) {
          this.showMessage('warning', 'Aucun client ne correspond à vos critères de recherche.');
        }
      },
      error: (error) => {
        this.showMessage('error', this.handleError(error));
      },
      complete: () => {
        this.isLoading = false;
        this.clearLoadingTimeout();
      }
    });
  }

  startEdit(client: any) {
    if (this.roleService.hasEditPermission()) {
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

    if (!this.roleService.hasEditPermission()) {
      this.showMessage('error', 'Vous n\'avez pas les permissions nécessaires.');
      return;
    }

    if (!this.validateClientData(this.editingClient)) {
      return;
    }

    this.isLoading = true;
    this.startLoadingTimeout();

    this.clientService.updateClient(this.editingClient.nni, this.editingClient).subscribe({
      next: () => {
        this.showMessage('success', 'Client mis à jour avec succès !');
        this.loadClients();
        this.editingClient = null;
      },
      error: (error) => {
        this.showMessage('error', this.handleError(error));
      },
      complete: () => {
        this.isLoading = false;
        this.clearLoadingTimeout();
      }
    });
  }

  deleteClient(nni: number) {
    if (!this.roleService.hasEditPermission()) {
      this.showMessage('error', 'Vous n\'avez pas les permissions nécessaires.');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.')) {
      return;
    }

    this.isLoading = true;
    this.startLoadingTimeout();

    this.clientService.deleteClient(nni).subscribe({
      next: () => {
        this.showMessage('success', 'Client supprimé avec succès !');
        this.loadClients();
      },
      error: (error) => {
        this.showMessage('error', this.handleError(error));
      },
      complete: () => {
        this.isLoading = false;
        this.clearLoadingTimeout();
      }
    });
  }
}