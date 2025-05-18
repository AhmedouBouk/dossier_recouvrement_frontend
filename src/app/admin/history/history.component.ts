import { Component, OnInit } from '@angular/core';
import { HistoryService } from '../../shared/services/history.service';
import { HistoryEvent } from '../../shared/models/history-event.model';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  historyEvents: HistoryEvent[] = [];
  loading = true;
  error = '';
  filterType = 'all';
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  Math = Math; // Exposer Math pour l'utiliser dans le template

  constructor(
    private readonly historyService: HistoryService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.loading = true;
    this.historyService.getHistory().subscribe({
      next: (events) => {
        this.historyEvents = events;
        this.totalItems = events.length;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading history:', err);
        this.error = 'Une erreur est survenue lors du chargement de l\'historique.';
        this.loading = false;
      }
    });
  }

  refreshHistory(): void {
    this.historyService.loadHistory();
  }

  getFilteredEvents(): HistoryEvent[] {
    let filtered = this.historyEvents;
    
    // Filtrer par type d'action
    if (this.filterType !== 'all') {
      filtered = filtered.filter(event => event.action === this.filterType);
    }
    
    // Filtrer par terme de recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(event => 
        event.username.toLowerCase().includes(term) ||
        event.entityType.toLowerCase().includes(term) ||
        (event.entityName?.toLowerCase().includes(term)) ||
        (event.details?.toLowerCase().includes(term))
      );
    }
    
    return filtered;
  }

  getPaginatedEvents(): HistoryEvent[] {
    const filtered = this.getFilteredEvents();
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return filtered.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onFilterChange(filterType: string): void {
    this.filterType = filterType;
    this.currentPage = 1;
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.currentPage = 1;
  }

  getActionIcon(action: string): string {
    switch (action) {
      case 'import': return 'file_upload';
      case 'delete': return 'delete';
      case 'create': return 'add_circle';
      case 'update': return 'edit';
      case 'LOGIN': return 'login';
      default: return 'info';
    }
  }

  getActionClass(action: string): string {
    switch (action) {
      case 'import': return 'import-action';
      case 'delete': return 'delete-action';
      case 'create': return 'create-action';
      case 'update': return 'update-action';
      case 'LOGIN': return 'login-action';
      default: return '';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString();
  }

  getFormattedDescription(event: HistoryEvent): string {
    switch (event.action) {
      case 'import':
        return `L'utilisateur "${event.username}" a importé le fichier "${event.entityName}"`;
      case 'delete':
        return `L'utilisateur "${event.username}" a supprimé ${event.entityType} "${event.entityName ?? event.entityId}"`;
      case 'create':
        return `L'utilisateur "${event.username}" a créé ${event.entityType} "${event.entityName ?? event.entityId}"`;
      case 'update':
        return `L'utilisateur "${event.username}" a modifié ${event.entityType} "${event.entityName ?? event.entityId}"`;
      case 'LOGIN':
        return `L'utilisateur "${event.username}" s'est connecté. ${event.details || ''}`;
      default:
        return `L'utilisateur "${event.username}" a effectué l'action "${event.action}" sur ${event.entityType} "${event.entityName ?? event.entityId}"`;
    }
  }
}
