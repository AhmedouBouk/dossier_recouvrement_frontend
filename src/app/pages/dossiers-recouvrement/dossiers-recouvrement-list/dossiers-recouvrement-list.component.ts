import { Component, OnInit } from '@angular/core';
import { DossierRecouvrementService } from 'src/app/shared/services/dossier-recouvrement.service';
import { DossierRecouvrement } from 'src/app/shared/models/dossier-recouvrement';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { RecouvrementRoleService } from 'src/app/shared/services/recouvrement-role.service';  // Import du service pour vérifier le rôle
import { Router } from '@angular/router';  // Import de Router pour la navigation

@Component({
  selector: 'app-dossiers-recouvrement-list',
  templateUrl: './dossiers-recouvrement-list.component.html',
  styleUrls: ['./dossiers-recouvrement-list.component.css']
})
export class DossiersRecouvrementListComponent implements OnInit {
  dossiers: DossierRecouvrement[] = [];
  file: File | null = null;

  constructor(
    private dossierService: DossierRecouvrementService,
    private http: HttpClient,
    private recouvrementRoleService: RecouvrementRoleService,
    private router: Router  // Injection de Router pour la navigation
  ) { }

  ngOnInit(): void {
    this.getDossiers();
  }

  getDossiers(): void {
    this.dossierService.getDossiers().subscribe((data: DossierRecouvrement[]) => {
      this.dossiers = data;
    });
  }

  deleteDossier(idDossier: number): void {
    this.dossierService.deleteDossier(idDossier).subscribe(() => {
      this.getDossiers();  // Recharger la liste après la suppression
    });
  }

  onFileChange(event: any): void {
    this.file = event.target.files[0];
  }

  onSubmit(): void {
    if (this.file) {
      const formData = new FormData();
      formData.append('file', this.file, this.file.name);

      this.http.post(`${environment.apiUrl}/DossierRecouvrement/detection-impayes`, formData).subscribe(
        (response) => {
          console.log('Fichier traité avec succès', response);
          this.getDossiers();
        },
        (error) => {
          console.error('Erreur lors du traitement du fichier', error);
        }
      );
    }
  }

  hasRecouvrementRole(): boolean {
    return this.recouvrementRoleService.hasRecouvrementRole();
  }
  hasDGCRRole(): boolean {
    return this.recouvrementRoleService.hasDGCRRole();
  }

  // Méthode pour rediriger vers la page de modification d'un dossier
  modifyDossier(idDossier: number): void {
    this.router.navigate([`/dossier-recouvrement/modify/${idDossier}`]);  // Redirige vers un formulaire de modification
  }

  // Méthode pour voir les détails d'un dossier
  viewDossier(idDossier: number): void {
    this.router.navigate([`/dossier-recouvrement/view/${idDossier}`]);  // Redirige vers une page de détails
  }
}
