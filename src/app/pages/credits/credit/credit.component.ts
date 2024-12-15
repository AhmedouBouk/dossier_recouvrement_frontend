import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreditService } from '../../../shared/services/credit.service';
import { CreditRoleService } from '../../../shared/services/credit-role.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-credit',
  templateUrl: './credit.component.html',
  styleUrls: ['./credit.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CreditComponent implements OnInit {
  credits: any[] = [];
  selectedCredit: any = null;
  searchTerm: string = '';

  constructor(
    private creditService: CreditService,
    public creditRoleService: CreditRoleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCredits();
  }
  
  loadCredits() {
    this.creditService.getAllCredits().subscribe({
      next: (data) => (this.credits = data),
      error: (err) => {
        console.error('Error loading credits:', err);
      }
    });
  }

  searchCredits() {
    if (this.searchTerm) {
      this.creditService.searchCredits(this.searchTerm).subscribe({
        next: (data) => (this.credits = data),
        error: (err) => console.error('Erreur de recherche', err)
      });
    } else {
      this.loadCredits();
    }
  }

  viewDetails(credit: any) {
    this.creditService.getCreditsDetails(credit.idCredit).subscribe({
      next: (details) => (this.selectedCredit = details),
      error: (err) => console.error('Erreur de récupération des détails', err)
    });
  }

  downloadFile(fileType: string) {
    if (this.selectedCredit) {
      this.creditService
        .downloadFile(this.selectedCredit.idCredit, fileType)
        .subscribe({
          next: (blob) => {
            const url = window.URL.createObjectURL(blob);
            window.open(url);
          },
          error: (err) => console.error('Erreur de téléchargement', err)
        });
    }
  }

  navigateToAdd() {
    this.router.navigate(['/credits/add']);
  }

  navigateToEdit(creditId: number) {
    this.router.navigate(['/credits/edit', creditId]);
  }

  deleteCredit(creditId: number) {
    if (confirm('Confirmer la suppression ?')) {
      this.creditService.deleteCredit(creditId).subscribe({
        next: () => this.loadCredits(),
        error: (err) => console.error('Erreur de suppression', err)
      });
    }
  }

  closeDetails() {
    this.selectedCredit = null;
  }
}