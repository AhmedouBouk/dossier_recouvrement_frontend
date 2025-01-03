import { Component, OnInit } from '@angular/core';
import { DossierRecouvrementService } from 'src/app/shared/services/dossier-recouvrement.service';
import { DossierRecouvrement } from 'src/app/shared/models/dossier-recouvrement';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';  // Import de Router pour la navigation
import{AuthService} from 'src/app/auth/auth.service'
@Component({
  selector: 'app-dossiers-recouvrement-list',
  templateUrl: './dossiers-recouvrement-list.component.html',
  styleUrls: ['./dossiers-recouvrement-list.component.css']
})
export class DossiersRecouvrementListComponent implements OnInit {
  dossiers: DossierRecouvrement[] = [];
  file: File | null = null;
  selectedFile: File | null = null;

  constructor(
    private dossierService: DossierRecouvrementService,
    private http: HttpClient,
    private authService: AuthService,
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

  deleteDossier(event: Event, idDossier: number): void {
    event.preventDefault();  // Empêche le rechargement de la page
  
    this.dossierService.deleteDossier(idDossier).subscribe({
      next: () => {
        // Mise à jour de la liste des dossiers sans recharger la page
        this.dossiers = this.dossiers.filter(dossier => dossier.idDossier !== idDossier);
      },
      error: (err) => {

      }
    });
  }
  
  

  onFileChange(event: any): void {
    this.file = event.target.files[0];
    this.selectedFile = event.target.files[0];
  }
  

  onSubmit(): void {
    if (this.file) {
      const formData = new FormData();
      formData.append('file', this.file, this.file.name);
      window.location.reload();
      this.http.post(`${environment.apiUrl}/DossierRecouvrement/detection-impayes`, formData).subscribe(
        (response) => {
          this.getDossiers();
        },
        (error) => {
          console.error('Erreur lors du traitement du fichier', error);
        }
      );
    }
  }

  hasRecouvrementRole(): boolean {
    return this.authService.hasRecouvrementRole();
  }
  hasDGCRRole(): boolean {
    return this.authService.hasDGCRRole();
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
