import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DossierRecouvrementService } from 'src/app/shared/services/dossier-recouvrement.service';
import { DossierRecouvrement } from 'src/app/shared/models/dossier-recouvrement';
import { CreditService } from 'src/app/shared/services/credit.service'; // Importez le service
import { Credit } from 'src/app/shared/models/credit.model';
import { slideInOut } from 'src/app/animations';
@Component({
  selector: 'app-dossiers-recouvrement-edit',
  templateUrl: './dossiers-recouvrement-edit.component.html',
  styleUrls: ['./dossiers-recouvrement-edit.component.css'],
  animations: [slideInOut] // Ajoutez l'animation ici
})
export class DossiersRecouvrementEditComponent implements OnInit {
  dossier!: DossierRecouvrement;
  creditId!: number; // ID du crédit à ajouter
isLoading: any;
errorMessage: any;
credits: Credit[] = [];
selectedCreditId: number | null = null; // ID du crédit sélectionné
showCreditForm: boolean = false; // Contrôle l'affichage du formulaire de crédit



  constructor(
    private route: ActivatedRoute,
    private dossierService: DossierRecouvrementService,
    private router: Router,
    private creditService: CreditService
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.dossierService.getDossierById(id).subscribe((data) => {
      this.dossier = data;

      // Récupérer les crédits associés au même compte
      this.creditService.rechercherParNomCompte(this.dossier.accountNumber).subscribe((credits) => {
        this.credits = credits;
      });
    });
  }

  // Méthode pour mettre à jour un dossier existant
  updateDossier(): void {
    this.dossierService.updateDossier(this.dossier.idDossier, this.dossier).subscribe(() => {
      this.router.navigate(['/dossier-recouvrement']);
    });
  }
  ajouterCredit(): void {
    if (this.selectedCreditId) {
      this.dossierService.ajouterCredit(this.dossier.idDossier, this.selectedCreditId).subscribe({
        next: (response) => {
          this.router.navigate(['/dossier-recouvrement']); // Rediriger après l'ajout
        },
        error: (err) => {
        }
      });
    } else {
    }
  }
  toggleCreditForm(): void {
    this.showCreditForm = !this.showCreditForm;
  }
}
