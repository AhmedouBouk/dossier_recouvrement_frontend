import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DossierRecouvrementService } from 'src/app/shared/services/dossier-recouvrement.service';
import { DossierRecouvrement } from 'src/app/shared/models/dossier-recouvrement.model';

interface Comment {
  id?: number;
  content: string;
  createdAt: string; // Changez de Date à string si le backend renvoie ISO string
  dossier?: any; // Facultatif, dépend de votre modèle
}

@Component({
  selector: 'app-dossier-recouvrement-details',
  templateUrl: './dossier-recouvrement-details.component.html',
  styleUrls: ['./dossier-recouvrement-details.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class DossierRecouvrementDetailsComponent implements OnInit {
  dossierDetails: DossierRecouvrement | null = null;
  comments: Comment[] = [];
  newComment: string = '';
  isLoading = false;
  errorMessage = '';
  showStatusSelection = false;
  selectedStatus: string = '';

  // Liste des statuts disponibles
  statusOptions = [
    'En cours de traitement',
    'Relancé',
    'Mis en demeure',
    'Protocole d\'accord signé',
    'Recouvrement amiable',
    'Non respect du protocole',
    'En justice',
    'Adjudication des garanties',
    'Clôturé'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dossierService: DossierRecouvrementService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const dossierId = params['id'];
      if (dossierId) {
        this.loadDossierDetails(dossierId);
        this.loadComments(dossierId);
      }
    });
  }

  loadDossierDetails(dossierId: number) {
    this.dossierService.getDossierById(dossierId).subscribe({
      next: (details) => this.dossierDetails = details,
      error: (err) => {
        console.error('Erreur de récupération des détails', err);
        this.router.navigate(['/dossiers']);
      }
    });
  }

  goBack() {
    this.router.navigate(['/dossiers']);
  }

  loadComments(dossierId: number) {
    this.dossierService.getComments(dossierId).subscribe({
      next: (comments) => this.comments = comments,
      error: (err) => console.error('Erreur de récupération des commentaires', err)
    });
  }

  addComment() {
    if (!this.newComment.trim() || !this.dossierDetails) return;

    this.isLoading = true;

    // Si un statut est sélectionné, mettre à jour le statut avec le commentaire
    if (this.showStatusSelection && this.selectedStatus) {
      this.dossierService.updateStatusWithComment(
        this.dossierDetails.id, 
        this.selectedStatus, 
        this.newComment
      ).subscribe({
        next: (comment) => {
          // Ajouter directement le nouveau commentaire à la liste
          this.comments.unshift(comment);
          this.newComment = '';
          this.selectedStatus = '';
          this.showStatusSelection = false;
          this.isLoading = false;

          // Recharger les détails du dossier pour afficher le nouveau statut
          this.loadDossierDetails(this.dossierDetails!.id);
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour du statut et de l\'ajout du commentaire', err);
          this.errorMessage = 'Erreur lors de la mise à jour du statut et de l\'ajout du commentaire';
          this.isLoading = false;
        }
      });
    } else {
      // Sinon, ajouter simplement un commentaire
      this.dossierService.addComment(this.dossierDetails.id, this.newComment).subscribe({
        next: (comment) => {
          // Ajouter directement le nouveau commentaire à la liste
          this.comments.unshift(comment);
          this.newComment = '';
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erreur lors de l\'ajout du commentaire', err);
          this.errorMessage = 'Erreur lors de l\'ajout du commentaire';
          this.isLoading = false;
        }
      });
    }
  }

  // Méthode pour basculer l'affichage de la sélection de statut
  toggleStatusSelection() {
    this.showStatusSelection = !this.showStatusSelection;
    if (!this.showStatusSelection) {
      this.selectedStatus = '';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Date inconnue';

    // Valider la chaîne ISO
    const timestamp = Date.parse(dateString);
    if (isNaN(timestamp)) return 'Date invalide';
  
    const date = new Date(timestamp);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'En cours': 'active',
      'En attente': 'pending',
      'Clôturé': 'closed',
      'Initiale': 'pending',
      'Validé': 'active',
      'Non Validé': 'closed'
    };
    
    return statusMap[status] || 'pending';
  }
}