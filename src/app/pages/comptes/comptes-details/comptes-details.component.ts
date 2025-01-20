import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { CompteService } from '../../../shared/services/compte.service';


@Component({
  selector: 'app-comptes-details',
  templateUrl: './comptes-details.component.html',
  styleUrls: ['./comptes-details.component.css']
})
export class ComptesDetailsComponent implements OnInit {
  compte: any;

  constructor(
    private route: ActivatedRoute,
    private compteService: CompteService,
    private location: Location
  ) {}

  ngOnInit(): void {
    const nomCompte = this.route.snapshot.paramMap.get('nomCompte');
    if (nomCompte) {
      this.compteService.getCompteByNomCompte(nomCompte).subscribe({
        next: (data) => {
          this.compte = data;
        },
        error: (error) => {
        }
      });
    }
  }

  goBack(): void {
    this.location.back();
  }
}
