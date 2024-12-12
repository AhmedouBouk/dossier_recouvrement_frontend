import { Component, OnInit } from '@angular/core';
import { ClientService } from '../../services/client.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ClientsComponent implements OnInit {
  clients: any[] = [];
  selectedFile: File | null = null;
  searchNom: string = '';
  searchPrenom: string = '';
  searchNNI: number | null = null;
  importMessage: { type: 'success' | 'error', text: string } | null = null;
  editingClient: any = null;

  constructor(private clientService: ClientService) { }

  ngOnInit() {
    this.loadClients();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  importClients() {
    if (this.selectedFile) {
      this.importMessage = null;
      this.clientService.importClients(this.selectedFile).subscribe({
        next: (response) => {
          if (response.status === 200) {
            this.importMessage = {
              type: 'success',
              text: 'Import réussi !'
            };
            this.loadClients();
            this.selectedFile = null;
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
          } else {
            this.importMessage = {
              type: 'error',
              text: 'Erreur lors de l\'import'
            };
          }
        },
        error: (error) => {
          this.importMessage = {
            type: 'error',
            text: 'Erreur lors de l\'import : ' + (error.error || error.message)
          };
        }
      });
    }
  }

  loadClients() {
    this.clientService.getAllClients().subscribe({
      next: (data) => {
        this.clients = data;
      },
      error: (error) => {
        console.error('Error fetching clients:', error);
      }
    });
  }

  searchClients() {
    this.clientService.searchClients(
      this.searchNom, 
      this.searchPrenom, 
      this.searchNNI || undefined
    ).subscribe({
      next: (data) => {
        this.clients = data;
      },
      error: (error) => {
        console.error('Error searching clients:', error);
      }
    });
  }

  startEdit(client: any) {
    this.editingClient = { ...client };
  }

  cancelEdit() {
    this.editingClient = null;
  }

  updateClient() {
    if (this.editingClient) {
      this.clientService.updateClient(this.editingClient.nni, this.editingClient).subscribe({
        next: (response) => {
          console.log('Update successful:', response);
          this.loadClients();
          this.editingClient = null;
        },
        error: (error) => {
          console.error('Error updating client:', error);
        }
      });
    }
  }

  deleteClient(nni: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      this.clientService.deleteClient(nni).subscribe({
        next: () => {
          this.loadClients();
        },
        error: (error) => {
          console.error('Error deleting client:', error);
        }
      });
    }
  }
}