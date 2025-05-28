// src/app/pages/lc-file-management/lc-file-management.component.ts
import { Component, OnInit } from '@angular/core';
import { DossierRecouvrementService } from 'src/app/shared/services/dossier-recouvrement.service';
import { DossierRecouvrement } from 'src/app/shared/models/dossier-recouvrement.model';
import { HttpErrorResponse } from '@angular/common/http';
import { LcFileService } from 'src/app/shared/services/lc-file.service';
import { RoleService } from 'src/app/shared/services/role.service';
import { AuthService } from 'src/app/auth/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
@Component({
  selector: 'app-lc-file-management',
  templateUrl: './lc-file-management.component.html',
  styleUrls: ['./lc-file-management.component.css'],
})
export class LcFileManagementComponent implements OnInit {
  dossiers: DossierRecouvrement[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private dossierService: DossierRecouvrementService,
    private lcFileService: LcFileService,
    public roleService: RoleService,
    public authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadDossiers();
  }

  // Charger la liste des dossiers
  loadDossiers(): void {
    this.isLoading = true;
    this.dossierService.getDossiers().subscribe({
      next: (data) => {
        this.dossiers = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des dossiers', err);
        this.errorMessage = 'Erreur lors du chargement des dossiers';
        this.isLoading = false;
      },
    });
  }

  
onLcFileSelectedAndUpload(event: any, dossier: any): void {
  const file: File = event.target.files[0];
  if (!file) return;

  dossier.selectedLcFile = file; // stocker temporairement
  this.uploadLcFile(dossier);   // lancer immédiatement l'upload
}

  // Uploader un fichier LC
  uploadLcFile(dossier: DossierRecouvrement): void {
    if (dossier.selectedLcFile) {
      this.isLoading = true;
      this.errorMessage = null;
      this.successMessage = null;

      this.lcFileService.uploadLcFile(dossier.id, dossier.selectedLcFile).subscribe({
        next: (response) => {
          console.log('Fichier LC uploadé avec succès', response);
          this.successMessage = 'Fichier LC uploadé avec succès';
          this.loadDossiers(); // Recharger la liste des dossiers
        },
        error: (err) => {
          console.error('Erreur lors de l\'upload du fichier LC', err);
          this.errorMessage = 'Erreur lors de l\'upload du fichier LC';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
    }
  }

  // Visualiser un fichier LC avec option de téléchargement
 // src/app/pages/lc-file-management/lc-file-management.component.ts
viewLcFile(dossier: DossierRecouvrement, download: boolean = false): void {
  if (!dossier.id) {
    alert('Aucun dossier sélectionné.');
    return;
  }

  // ⚠️ Nouvelle URL : on passe l’ID du dossier, pas le chemin
  const fileUrl = `/api/lc-files/pdf/${dossier.id}`;
  const token = this.authService.getToken();

  fetch(fileUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(res => {
    if (!res.ok) throw new Error('Erreur lors du chargement du fichier');
    return res.blob();
  })
  .then(blob => {
    const blobUrl = URL.createObjectURL(blob);
    if (download) {
      const a = document.createElement('a');
      a.href = blobUrl;
      // nom du fichier : dossier.lcFile contient son chemin local
      a.download = dossier.lcFile.split('/').pop() || 'lcfile.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      window.open(blobUrl, '_blank');
    }
  })
  .catch(err => {
    console.error(err);
    alert('Impossible de charger le fichier.');
  });
}

                      

  // Supprimer un fichier LC
  deleteLcFile(dossier: DossierRecouvrement): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fichier LC ?')) {
      this.isLoading = true;
      this.errorMessage = null;
      this.successMessage = null;

      this.lcFileService.deleteLcFile(dossier.id).subscribe({
        next: () => {
          this.successMessage = 'Fichier LC supprimé avec succès';
          this.loadDossiers(); // Recharger la liste des dossiers
        },
        error: (err: HttpErrorResponse) => {
          console.error('Erreur lors de la suppression du fichier LC', err);
          this.errorMessage = 'Erreur lors de la suppression du fichier LC';
        },
        complete: () => {
          this.isLoading = false;
        },
      });
    }
  }

  // Gérer la recherche
  onSearchChange(event: any): void {
    this.searchTerm = event.target.value;
    // Implémentez la logique de recherche si nécessaire
  }
}