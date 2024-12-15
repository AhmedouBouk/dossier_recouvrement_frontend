import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DossierRecouvrementService } from 'src/app/shared/services/dossier-recouvrement.service';
import { DossierRecouvrement } from 'src/app/shared/models/dossier-recouvrement';

@Component({
  selector: 'app-dossiers-recouvrement-edit',
  templateUrl: './dossiers-recouvrement-edit.component.html',
  styleUrls: ['./dossiers-recouvrement-edit.component.css']
})
export class DossiersRecouvrementEditComponent implements OnInit {
  dossier!: DossierRecouvrement;

  constructor(
    private route: ActivatedRoute,
    private dossierService: DossierRecouvrementService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    // Récupérer le dossier existant depuis le backend
    this.dossierService.getDossierById(id).subscribe((data) => {
      this.dossier = data;
    });
  }


  // Méthode pour mettre à jour un dossier existant
  updateDossier(): void {
    this.dossierService.updateDossier(this.dossier.idDossier, this.dossier).subscribe(() => {
      this.router.navigate(['/dossiers-recouvrement']);
    });
  }
}
