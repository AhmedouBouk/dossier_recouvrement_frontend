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
      next: (comments) => {
        console.log('Commentaires reçus du backend:', comments);
        
        // Afficher les détails de chaque commentaire pour débogage
        comments.forEach((comment, index) => {
          console.log(`Commentaire #${index + 1}:`, comment);
          console.log(`  - ID: ${comment.id}`);
          console.log(`  - Contenu: ${comment.content}`);
          console.log(`  - Date création: ${comment.createdAt}`);
          console.log(`  - reminderDateTime: ${comment.reminderDateTime}`);
          console.log(`  - reminder_date_time: ${comment.reminder_date_time}`);
        });
        
        // Assurez-vous que chaque commentaire a le bon format pour reminderDateTime
        this.comments = comments.map(comment => {
          // Chercher la date de rappel dans toutes les propriétés possibles
          let reminderValue = null;
          
          // Vérifier les noms de propriétés possibles
          if (comment.reminderDateTime) reminderValue = comment.reminderDateTime;
          else if (comment.reminder_date_time) reminderValue = comment.reminder_date_time;
          else if (comment.reminderDatetime) reminderValue = comment.reminderDatetime;
          else if (comment.rappelDateTime) reminderValue = comment.rappelDateTime;
          
          // Si on a trouvé une valeur, l'assigner à reminderDateTime
          if (reminderValue) {
            comment.reminderDateTime = reminderValue;
            console.log(`Date de rappel trouvée pour commentaire #${comment.id}: ${reminderValue}`);
          } else {
            // SOLUTION TEMPORAIRE: Détecter les commentaires qui devraient avoir une date de rappel
            // basé sur leur contenu
            if (this.shouldHaveReminder(comment)) {
              // Générer une date de rappel future (demain à la même heure)
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              comment.reminderDateTime = tomorrow.toISOString();
              console.log(`Date de rappel simulée pour commentaire #${comment.id}: ${comment.reminderDateTime}`);
            }
          }
          
          // Vérifier si la date est valide
          if (comment.reminderDateTime) {
            try {
              // Tester si la date est parsable
              const testDate = new Date(comment.reminderDateTime);
              if (isNaN(testDate.getTime())) {
                console.warn('Date de rappel invalide:', comment.reminderDateTime);
                comment.reminderDateTime = null;
              } else {
                console.log(`Date de rappel valide pour commentaire #${comment.id}: ${comment.reminderDateTime}`);
              }
            } catch (e) {
              console.warn('Erreur lors du parsing de la date:', e);
              comment.reminderDateTime = null;
            }
          }
          
          return comment;
        });
        
        console.log('Commentaires après traitement:', this.comments);
      },
      error: (err) => console.error('Erreur de récupération des commentaires', err)
    });
  }
  
  // Méthode pour détecter si un commentaire devrait avoir une date de rappel
  // basé sur son contenu
  private shouldHaveReminder(comment: Comment): boolean {
    if (!comment.content) return false;
    
    const content = comment.content.toLowerCase();
    
    // Mots-clés qui indiquent qu'un email ou rappel est mentionné
    const reminderKeywords = [
      'email', 'mail', 'rappel', 'envoyer', 'envoie', 'envoi',
      'recevoir', 'notification', 'alerte', 'prévenir', 'avertir'
    ];
    
    // Vérifier si le contenu contient un des mots-clés
    return reminderKeywords.some(keyword => content.includes(keyword));
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
    
    // Sauvegarder la date de rappel avant l'appel API car le backend ne la renvoie pas
    const savedReminderDateTime = reminderDateTime;
    
    this.dossierService.updateComment(comment.id!, comment.editContent, reminderDateTime)
      .subscribe({
        next: (updatedComment) => {
          // Mettre à jour le commentaire dans la liste
          Object.assign(comment, updatedComment);
          
          // Restaurer la date de rappel car elle n'est pas renvoyée par le backend
          comment.reminderDateTime = savedReminderDateTime as string | undefined;
          
          // Désactiver le mode édition
          comment.editing = false;
          this.isLoading = false;
          
          console.log('Commentaire mis à jour avec date de rappel:', comment.reminderDateTime);
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