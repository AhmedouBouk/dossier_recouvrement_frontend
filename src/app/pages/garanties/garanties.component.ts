import { Component, OnInit } from '@angular/core';
import { GarantieService } from '../../shared/services/garantie.service';
import { Garantie } from '../../shared/models/garantie.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/auth/auth.service';
@Component({
  selector: 'app-garanties',
  templateUrl: './garanties.component.html',
  styleUrls: ['./garanties.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class GarantiesComponent implements OnInit {
  garanties: Garantie[] = [];
  selectedGarantie: Garantie | null = null;
  newGarantie: Partial<Garantie> = {};
  file: File | null = null;
  editMode: boolean = false;

  constructor(
    private garantieService: GarantieService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.loadGaranties();
  }

  // Charger toutes les garanties
  loadGaranties() {
    this.garantieService.getAllGaranties().subscribe({
      next: (data) => {
        this.garanties = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des garanties:', error);
      }
    });
  }

  // Ajouter une garantie
  addGarantie() {
    if (this.newGarantie.typeGarantie && this.newGarantie.valeur && this.file) {
      this.garantieService.createGarantie(
        this.newGarantie.typeGarantie,
        this.newGarantie.valeur,
        this.file
      ).subscribe({
        next: (data) => {
          console.log('Garantie créée:', data);
          this.loadGaranties();
          this.newGarantie = {};
          this.file = null;
        },
        error: (error) => {
          console.error('Erreur lors de la création de la garantie:', error);
        }
      });
    }
  }

  // Mettre à jour une garantie
  updateGarantie() {
    if (this.selectedGarantie) {
      this.garantieService.updateGarantie(this.selectedGarantie.idGarantie!, this.selectedGarantie).subscribe({
        next: (data) => {
          console.log('Garantie mise à jour:', data);
          this.loadGaranties();
          this.selectedGarantie = null;
          this.editMode = false;
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour:', error);
        }
      });
    }
  }

  // Supprimer une garantie
  deleteGarantie(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette garantie ?')) {
      this.garantieService.deleteGarantie(id).subscribe({
        next: (response) => {
          console.log('Garantie supprimée:', response);
          this.loadGaranties();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
        }
      });
    }
  }

  // Télécharger le PDF d'une garantie
  downloadPdf(id: number) {
    this.garantieService.downloadPdf(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'description.pdf';
        link.click();
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement:', error);
      }
    });
  }

  // Gestion du fichier sélectionné
  onFileSelected(event: any) {
    this.file = event.target.files[0];
  }

  // Activer le mode édition
  startEdit(garantie: Garantie) {
    this.selectedGarantie = { ...garantie };
    this.editMode = true;
  }

  // Annuler le mode édition
  cancelEdit() {
    this.selectedGarantie = null;
    this.editMode = false;
  }
}
