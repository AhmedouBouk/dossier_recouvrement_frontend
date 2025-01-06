import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreditService } from '../../../shared/services/credit.service';
import { AuthService } from 'src/app/auth/auth.service';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { RoleService } from 'src/app/shared/services/role.service';
import { Credit } from '../../../shared/models/credit.model';

@Component({
  selector: 'app-credit',
  templateUrl: './credit.component.html',
  styleUrls: ['./credit.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CreditComponent implements OnInit, OnDestroy {
  credits: Credit[] = [];  // Initialize as empty array
  searchTerm: string = '';
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  isLoading = false;
  error: string | null = null;

  constructor(
    private creditService: CreditService,
    public authService: AuthService,
    public roleService: RoleService,
    private router: Router
  ) {
    this.searchSubject.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.performSearch(term);
    });
  }

  ngOnInit(): void {
    this.loadCredits();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  loadCredits() {
    this.isLoading = true;
    this.error = null;
    this.creditService.getAllCredits().subscribe({
      next: (data) => {
        this.credits = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading credits:', err);
        this.error = typeof err === 'string' ? err : 'Une erreur est survenue lors du chargement des crédits';
        this.isLoading = false;
      }
    });
  }

  onSearchChange(event: any) {
    const term = event.target.value;
    this.searchSubject.next(term);
  }

  private performSearch(term: string) {
    if (!term.trim()) {
      this.loadCredits();
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.creditService.searchCredits(term).subscribe({
      next: (data) => {
        this.credits = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur de recherche', err);
        this.error = typeof err === 'string' ? err : 'Une erreur est survenue lors de la recherche';
        this.isLoading = false;
      }
    });
  }

  navigateToDetails(creditId: number) {
    if (creditId) {
      this.router.navigate(['/credits/details', creditId]);
    }
  }

  navigateToEdit(creditId: number) {
    if (creditId) {
      this.router.navigate(['/credits/edit', creditId]);
    }
  }

  navigateToAdd() {
    this.router.navigate(['/credits/add']);
  }

  deleteCredit(creditId: number) {
    if (creditId && confirm('Confirmer la suppression ?')) {
      this.creditService.deleteCredit(creditId).subscribe({
        next: () => this.loadCredits(),
        error: (err) => {
          console.error('Erreur de suppression', err);
          this.error = typeof err === 'string' ? err : 'Une erreur est survenue lors de la suppression';
        }
      });
    }
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'En cours': 'active',
      'En attente': 'pending',
      'Clôturé': 'closed',
      'Approuvé': 'active',
      'Refusé': 'closed',
      'En traitement': 'pending'
    };
    return statusMap[status] || 'pending';
  }

  onFileUpload(event: any): void {
    const file: File = event.target.files[0];
    if (!file) {
      return;
    }
  
    const formData = new FormData();
    formData.append('file', file);
  
    this.isLoading = true;
    this.error = null;
  
    this.creditService.uploadCSV(formData).subscribe({
      next: (response: any) => {
        this.loadCredits(); // Recharge la liste des crédits après l'upload
        this.isLoading = false;
      },
      error: (err: string | null) => {
        console.error('Erreur lors de l\'upload du fichier CSV :', err);
        this.error = typeof err === 'string' ? err : 'Une erreur est survenue lors de l\'upload';
        this.isLoading = false;
      }
    });
  }
  
}