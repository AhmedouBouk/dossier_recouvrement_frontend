import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClientService } from '../../../shared/services/client.service';
import { Location } from '@angular/common';
@Component({
  selector: 'app-client-details',
  templateUrl: './client-details.component.html',
  styleUrls: ['./client-details.component.css']
})
export class ClientDetailsComponent implements OnInit {
  client: any;

  constructor(private route: ActivatedRoute, private clientService: ClientService,private location: Location) {}


  ngOnInit(): void {
    const nni = this.route.snapshot.paramMap.get('nni'); // Récupère l'identifiant (NNI) depuis l'URL
    if (nni) {
      this.clientService.getClientByNni(nni).subscribe({
        next: (data) => {
          this.client = data; // Stocke les données du client
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
