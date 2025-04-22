import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DossierRecouvrementService } from 'src/app/shared/services/dossier-recouvrement.service';
import { DossierRecouvrement } from 'src/app/shared/models/dossier-recouvrement.model';
import { AuthService } from 'src/app/auth/auth.service';
import { UserDataService } from 'src/app/shared/services/user-data.service';

interface Comment {
  id?: number;
  content: string;
  createdAt: string;
  dossierId?: number;
  user?: { id: number; name: string };
  reminderDateTime?: string;
  // Propriétés pour l'édition (non envoyées au backend)
  editing?: boolean;
  editContent?: string;
  editReminderDate?: string;
  editReminderTime?: string;
}

@Component({
  selector: 'app-dossier-recouvrement-details',
  templateUrl: './dossier-recouvrement-details.component.html',
  styleUrls: ['./dossier-recouvrement-details.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class DossierRecouvrementDetailsComponent implements OnInit {
  reminderDate: string = '';
  reminderTime: string = '';
  currentUserId: number | null = null; // ID de l'utilisateur connecté
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
    private dossierService: DossierRecouvrementService,
    private authService: AuthService,
    private userDataService: UserDataService
  ) {
    // Pour les besoins de test, nous utilisons un ID fixe qui correspond à l'utilisateur connecté
    // Dans un environnement de production, cette valeur devrait être récupérée dynamiquement
    this.currentUserId = 1;
  }

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

    // Construction du champ reminderDateTime si les deux champs sont remplis
    let reminderDateTime: string | null = null;
    if (this.reminderDate && this.reminderTime) {
      // Format attendu par le backend : yyyy-MM-dd'T'HH:mm:ss
      reminderDateTime = this.reminderDate + 'T' + this.reminderTime + ':00';
    }

    // Si un statut est sélectionné, mettre à jour le statut avec le commentaire
    if (this.showStatusSelection && this.selectedStatus) {
      this.dossierService.updateStatusWithComment(
        this.dossierDetails.id, 
        this.selectedStatus, 
        this.newComment,
        reminderDateTime
      ).subscribe({
        next: (comment) => {
          // Ajouter directement le nouveau commentaire à la liste
          this.comments.unshift(comment);
          this.newComment = '';
          this.selectedStatus = '';
          this.showStatusSelection = false;
          this.reminderDate = '';
          this.reminderTime = '';
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
      this.dossierService.addComment(this.dossierDetails.id, this.newComment, reminderDateTime).subscribe({
        next: (comment) => {
          // Ajouter directement le nouveau commentaire à la liste
          this.comments.unshift(comment);
          this.newComment = '';
          this.reminderDate = '';
          this.reminderTime = '';
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
  
  // Vérifie si l'utilisateur connecté peut éditer/supprimer un commentaire
  canEditComment(comment: Comment): boolean {
    // Pour les besoins de test, nous autorisons toujours l'utilisateur à éditer/supprimer les commentaires
    // Dans un environnement de production, cette logique devrait être plus stricte
    return true;
  }
  
  // Préparer un commentaire pour l'édition
  editComment(comment: Comment): void {
    // Initialiser les champs d'édition
    comment.editing = true;
    comment.editContent = comment.content;
    
    // Si le commentaire a une date de rappel, la décomposer en date et heure
    if (comment.reminderDateTime) {
      const dateTime = new Date(comment.reminderDateTime);
      comment.editReminderDate = dateTime.toISOString().split('T')[0]; // format YYYY-MM-DD
      comment.editReminderTime = dateTime.toTimeString().substring(0, 5); // format HH:MM
    } else {
      comment.editReminderDate = '';
      comment.editReminderTime = '';
    }
  }
  
  // Annuler l'édition d'un commentaire
  cancelEdit(comment: Comment): void {
    comment.editing = false;
    comment.editContent = undefined;
    comment.editReminderDate = undefined;
    comment.editReminderTime = undefined;
  }
  
  // Enregistrer les modifications d'un commentaire
  saveComment(comment: Comment): void {
    if (!comment.editContent || comment.editContent.trim() === '') {
      return; // Ne pas enregistrer si le contenu est vide
    }
    
    this.isLoading = true;
    
    // Construire la date de rappel si les deux champs sont remplis
    let reminderDateTime: string | null = null;
    if (comment.editReminderDate && comment.editReminderTime) {
      reminderDateTime = comment.editReminderDate + 'T' + comment.editReminderTime + ':00';
    }
    
    this.dossierService.updateComment(comment.id!, comment.editContent, reminderDateTime)
      .subscribe({
        next: (updatedComment) => {
          // Mettre à jour le commentaire dans la liste
          Object.assign(comment, updatedComment);
          comment.editing = false;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour du commentaire', err);
          this.errorMessage = 'Erreur lors de la mise à jour du commentaire';
          this.isLoading = false;
        }
      });
  }
  
  // Confirmer la suppression d'un commentaire
  confirmDeleteComment(comment: Comment): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      this.deleteComment(comment);
    }
  }
  
  // Supprimer un commentaire
  deleteComment(comment: Comment): void {
    this.isLoading = true;
    
    this.dossierService.deleteComment(comment.id!)
      .subscribe({
        next: () => {
          // Retirer le commentaire de la liste
          this.comments = this.comments.filter(c => c.id !== comment.id);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erreur lors de la suppression du commentaire', err);
          this.errorMessage = 'Erreur lors de la suppression du commentaire';
          this.isLoading = false;
        }
      });
  }
}