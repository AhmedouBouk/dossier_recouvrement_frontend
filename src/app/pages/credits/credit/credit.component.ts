import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreditService } from '../../../shared/services/credit.service';
import { AuthService } from 'src/app/auth/auth.service';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { RoleService } from 'src/app/shared/services/role.service';

@Component({
  selector: 'app-credit',
  templateUrl: './credit.component.html',
  styleUrls: ['./credit.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CreditComponent implements OnInit, OnDestroy {
  credits: any[] = [];
  searchTerm: string = '';
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  isLoading = false;

  constructor(
    private creditService: CreditService,
    public authService: AuthService,
    public RoleService: RoleService,
    private router: Router
  ) {
    // Subscribe to search changes
    this.searchSubject.pipe(
      takeUntil(this.destroy$),
      debounceTime(300), // Wait 300ms after the last event before emitting
      distinctUntilChanged() // Only emit if the value is different from the previous
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
    this.creditService.getAllCredits().subscribe({
      next: (data) => {
        this.credits = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading credits:', err);
        this.isLoading = false;
      }
    });
  }

  // Called when input changes
  onSearchChange(event: any) {
    const term = event.target.value;
    this.searchSubject.next(term);
  }

  // Perform the actual search
  private performSearch(term: string) {
    if (!term.trim()) {
      this.loadCredits();
      return;
    }

    this.isLoading = true;
    this.creditService.searchCredits(term).subscribe({
      next: (data) => {
        this.credits = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur de recherche', err);
        this.isLoading = false;
      }
    });
  }

  navigateToDetails(creditId: number) {
    this.router.navigate(['/credits/details', creditId]);
  }

  navigateToEdit(creditId: number) {
    this.router.navigate(['/credits/edit', creditId]);
  }

  navigateToAdd() {
    this.router.navigate(['/credits/add']);
  }

  deleteCredit(creditId: number) {
    if (confirm('Confirmer la suppression ?')) {
      this.creditService.deleteCredit(creditId).subscribe({
        next: () => this.loadCredits(),
        error: (err) => console.error('Erreur de suppression', err)
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
}