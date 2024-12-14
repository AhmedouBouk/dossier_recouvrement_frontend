import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DossierRecouvrementService } from 'src/app/shared/services/dossier-recouvrement.service';
import { DossierRecouvrement } from 'src/app/shared/models/dossier-recouvrement';

@Component({
  selector: 'app-dossiers-recouvrement-detail',
  templateUrl: './dossiers-recouvrement-detail.component.html',
  styleUrls: ['./dossiers-recouvrement-detail.component.css']
})
export class DossiersRecouvrementDetailComponent implements OnInit {
  dossier!: DossierRecouvrement;

  constructor(
    private route: ActivatedRoute,
    private dossierService: DossierRecouvrementService
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.dossierService.getDossierById(id).subscribe((data) => {
      this.dossier = data;
    });
  }
}
