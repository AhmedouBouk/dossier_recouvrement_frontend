import { Component, OnInit } from '@angular/core';
import { DossierRecouvrementService } from 'src/app/shared/services/dossier-recouvrement.service';
import { DossierRecouvrement } from 'src/app/shared/models/dossier-recouvrement';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-dossiers-recouvrement-detail',
  templateUrl: './dossiers-recouvrement-detail.component.html',
  styleUrls: ['./dossiers-recouvrement-detail.component.css']
})
export class DossiersRecouvrementDetailComponent implements OnInit {
  dossier!: DossierRecouvrement;

  constructor(
    private route: ActivatedRoute,
    private dossierService: DossierRecouvrementService,
    private router: Router


  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.dossierService.getDossierById(id).subscribe((data) => {
      this.dossier = data;
    });
  }
  goBack(): void{
    this.router.navigate(['/dossiers-recouvrement']);
  }
}
