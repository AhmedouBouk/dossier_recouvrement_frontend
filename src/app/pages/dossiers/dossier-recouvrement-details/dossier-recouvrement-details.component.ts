import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DossierRecouvrementService } from 'src/app/shared/services/dossier-recouvrement.service';
import { DossierRecouvrement } from 'src/app/shared/models/dossier-recouvrement.model';
import { Garantie } from 'src/app/shared/models/garantie.model';
import { AuthService } from 'src/app/auth/auth.service';
import { UserDataService } from 'src/app/shared/services/user-data.service';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { GarantieService } from 'src/app/shared/services/garantie.service';
import { LcFileService } from 'src/app/shared/services/lc-file.service';
import { CreditsFileService } from 'src/app/shared/services/credits-file.service';
import { ChequeFileService } from 'src/app/shared/services/cheque-file.service';
import { CautionsFileService } from 'src/app/shared/services/cautions-file.service';
import { RoleService } from 'src/app/shared/services/role.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

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
  imports: [CommonModule, FormsModule],
  schemas: [NO_ERRORS_SCHEMA]
})
export class DossierRecouvrementDetailsComponent implements OnInit {
  reminderDate: string = ''; 
  reminderTime: string = '';
  currentUserId: number | null = null; // ID de l'utilisateur connecté
  dossierDetails: DossierRecouvrement | null = null;
  dossier: any;
  comments: Comment[] = [];
  newComment: string = '';
  isLoading = false;
  errorMessage = '';
  showStatusSelection = false;
  selectedStatus: string = '';
  commentairesParDossier: { [id: number]: any[] } = {};
  // Liste des statuts disponibles
  statusOptions = [
    'EN_COURS',
    'ARCHIVEE'
  ];
  
  // Mapping pour l'affichage des statuts
  statusDisplayMap: { [key: string]: string } = {
    'EN_COURS': 'En cours',
    'ARCHIVEE': 'Archivé'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dossierService: DossierRecouvrementService,
    private authService: AuthService,
    private userDataService: UserDataService,
        private garantieService: GarantieService,
            private lcFileService: LcFileService,
                private creditsFileService: CreditsFileService,
                    private chequeFileService: ChequeFileService, // Injectez le ChequeFileService
                        private cautionsFileService: CautionsFileService,
                    
                    public roleService: RoleService,
                
            
        
    
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
  
  viewGarantieFile(dossier: DossierRecouvrement, garantieIdOrIndex?: number | string, download: boolean = false): void {
    if (!dossier.garanties || dossier.garanties.length === 0) {
      alert('Aucune garantie trouvée pour ce dossier.');
      return;
    }

    // If garantieId is provided, view that specific garantie
    // Otherwise, if there's only one garantie, view that one
    // If multiple garanties and no ID specified, show selection dialog
    let selectedGarantie: Garantie | undefined;
    
    if (typeof garantieIdOrIndex === 'number') {
      // If it's a number, treat it as an ID
      selectedGarantie = dossier.garanties.find(g => g.id === garantieIdOrIndex);
      if (!selectedGarantie) {
        alert('Garantie non trouvée.');
        return;
      }
    } else if (typeof garantieIdOrIndex === 'string') {
      // If it's a string, treat it as an index
      const index = Number(garantieIdOrIndex) - 1;
      if (isNaN(index) || index < 0 || index >= dossier.garanties.length) {
        alert('Index de garantie invalide.');
        return;
      }
      selectedGarantie = dossier.garanties[index];
    } else if (dossier.garanties.length === 1) {
      // If no ID/index provided but only one garantie exists
      selectedGarantie = dossier.garanties[0];
    } else {
      // Multiple garanties but no ID/index provided
      alert('Veuillez spécifier une garantie.');
      return;
    }

    if (!selectedGarantie) {
      alert('Garantie introuvable.');
      return;
    }

    if (!selectedGarantie.id) {
      alert('ID de garantie invalide.');
      return;
    }

    // Use the garantie service to get the PDF by ID instead of direct file access
    this.garantieService.getGarantiePdf(selectedGarantie.id)
      .subscribe({
        next: (blob) => {
          const blobUrl = URL.createObjectURL(blob);
          if (download) {
            const a = document.createElement('a');
            a.href = blobUrl;
            // Add null checks and provide fallback values
            if (selectedGarantie && selectedGarantie.filePath) {
              const fileName = selectedGarantie.filePath.split('/').pop() || `garantie_${selectedGarantie.id || 'unknown'}.pdf`;
              a.download = fileName;
            } else if (selectedGarantie && selectedGarantie.id) {
              a.download = `garantie_${selectedGarantie.id}.pdf`;
            } else {
              a.download = 'garantie.pdf';
            }
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } else {
            window.open(blobUrl, '_blank');
          }
        },
        error: (error) => {
          console.error('Erreur:', error);
          alert('Impossible de charger le fichier.');
        }
      });
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
    viewLcFile(dossier: DossierRecouvrement, download: boolean = false): void {
      if (!dossier.lcFile) {
        alert('Aucun fichier trouvé pour ce dossier.');
        return;
      }
  
      const fileUrl = this.lcFileService.getFullFileUrl(dossier.lcFile);
      const token = this.authService.getToken(); // Récupérer le token JWT
  
      fetch(fileUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}` // Ajouter le token JWT dans l'en-tête
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Erreur lors du chargement du fichier');
        }
        return response.blob(); // Convertir la réponse en Blob
      })
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob); // Créer un lien temporaire
  
        if (download) {
          // Télécharger le fichier
          const a = document.createElement('a');
          a.href = blobUrl;
          const lcFile = dossier.lcFile;
          a.download = lcFile ? lcFile.split('/').pop() || 'file.pdf' : 'file.pdf'; // Nom du fichier
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else {
          // Ouvrir dans un nouvel onglet
          window.open(blobUrl, '_blank');
        }
      })
      .catch(error => {
        console.error('Erreur:', error);
        alert('Impossible de charger le fichier.');
      });
    }
  
 viewCreditsFile(dossier: DossierRecouvrement, download: boolean = false): void {
    if (!dossier.creditsFile) {
      alert('Aucun fichier trouvé pour ce dossier.');
      return;
    }
  
    const fileUrl = this.creditsFileService.getFullFileUrl(dossier.creditsFile);
    const token = this.authService.getToken(); // Récupérer le token JWT
  
    fetch(fileUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}` // Ajouter le token JWT dans l'en-tête
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du fichier');
      }
      return response.blob(); // Convertir la réponse en Blob
    })
    .then(blob => {
      const blobUrl = URL.createObjectURL(blob); // Créer un lien temporaire
  
      if (download) {
        // Télécharger le fichier
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = dossier.creditsFile.split('/').pop() || 'file.pdf'; // Nom du fichier
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // Ouvrir dans un nouvel onglet
        window.open(blobUrl, '_blank');
      }
    })
    .catch(error => {
      console.error('Erreur:', error);
      alert('Impossible de charger le fichier.');
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
viewChequeFile(dossier: DossierRecouvrement, download: boolean = false): void {
  if (!dossier.chequeFiles || dossier.chequeFiles.length === 0) {
    alert('Aucun fichier trouvé pour ce dossier.');
    return;
  }
  
  // Temporary message until modal is fully integrated
  alert('La gestion des multiples fichiers de chèques sera disponible prochainement.');
  // Future implementation will open a modal to select which cheque file to view/download
}

viewCautionsFile(dossier: DossierRecouvrement, download: boolean = false): void {
  if (!dossier.cautionsFile) {
    alert('Aucun fichier trouvé pour ce dossier.');
    return;
  }

  const fileUrl = this.cautionsFileService.getFullFileUrl(dossier.cautionsFile);
  const token = this.authService.getToken(); // Récupérer le token JWT

  fetch(fileUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}` // Ajouter le token JWT dans l'en-tête
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Erreur lors du chargement du fichier');
    }
    return response.blob(); // Convertir la réponse en Blob
  })
  .then(blob => {
    const blobUrl = URL.createObjectURL(blob); // Créer un lien temporaire

    if (download) {
      // Télécharger le fichier
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = dossier.cautionsFile.split('/').pop() || 'file.pdf'; // Nom du fichier
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Ouvrir dans un nouvel onglet
      window.open(blobUrl, '_blank');
    }
  })
  .catch(error => {
    console.error('Erreur:', error);
    alert('Impossible de charger le fichier.');
  });
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

  getStatusClass(status: string | undefined): string {
    const statusText = status || '';
    switch (statusText.toLowerCase()) {
      case 'en cours':
        return 'status-in-progress';
      case 'clôturé':
        return 'status-closed';
      case 'en attente':
        return 'status-pending';
      default:
        return 'status-unknown';
    }
  }
  
  // Vérifie si l'utilisateur connecté peut éditer/supprimer un commentaire
canComment(): boolean {
  return this.roleService.hasCommentairePermission();
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
          // Mettre à jour le commentaire dans la liste avec la réponse du backend
          Object.assign(comment, updatedComment);
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

  generatePDF() {
    try {
      if (!this.dossierDetails) {
        console.error('Aucun dossier disponible pour la génération du PDF');
        return;
      }
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let y = margin; // Commencer au niveau de la marge

      // --- Configuration du Logo ---
      const logoPath = 'assets/logo.png'; // <-- Chemin vers votre logo
      const logoFormat = 'PNG'; // <-- Spécifiez le format (ex: 'PNG', 'JPEG')
      const logoWidth = 25; // Ajustez la largeur
      const logoHeight = 25; // Ajustez la hauteur (maintenez les proportions)
      const logoX = margin; // Position X (gauche)
      const logoY = margin; // Position Y (haut)

       try {
           // jsPDF va essayer de charger l'image à partir de ce chemin
           doc.addImage(logoPath, logoFormat, logoX, logoY, logoWidth, logoHeight);
       } catch (e) {
           console.error('Erreur lors de l\'ajout du logo. Assurez-vous que le chemin est correct et que l\'image est accessible:', e);
       }
      // --------------------------------

      // Titre du document (sans en-tête bleu)
      doc.setFontSize(24); // Taille plus grande pour un titre principal
      doc.setTextColor(30, 64, 175); // Couleur bleue/grise foncée pour le titre
      // Positionner le titre à droite du logo ou centré si pas de logo
      const titleX = logoPath && logoPath !== 'assets/logo.png' ? margin + logoWidth + 10 : pageWidth / 2;
      const titleAlign = logoPath && logoPath !== 'assets/logo.png' ? 'left' : 'center';
      doc.text('Dossier de Recouvrement', titleX, margin + (logoHeight > 0 ? logoHeight / 2 : 10), { align: titleAlign }); // Ajuster Y pour aligner avec logo ou marge

      doc.setTextColor(0, 0, 0); // Rétablir la couleur noire pour le corps du document
      // Démarrer le contenu sous le titre et/ou le logo
      y = margin + (logoHeight > 0 ? logoHeight : 20) + 15; // Position Y pour le contenu

      function cleanNumeric(val: any): string {
        // Si c'est un nombre, on le formate avec espace pour les milliers
        if (typeof val === 'number') {
          return val.toLocaleString('fr-FR', { useGrouping: true, maximumFractionDigits: 0 });
        }
        // Si c'est une chaîne, on enlève tout sauf chiffres
        if (typeof val === 'string') {
          // On enlève tout sauf chiffres
          const cleaned = val.replace(/[^0-9]/g, '');
          if (cleaned.length > 0) {
            // On parse en nombre puis on re-formate
            return Number(cleaned).toLocaleString('fr-FR', { useGrouping: true, maximumFractionDigits: 0 });
          }
          return '';
        }
        return '';
      }

      // Préparation des données pour la grille 3 colonnes
      // LOGS DIAGNOSTIC
      console.log('Montant Principal brut:', this.dossierDetails.montantPrincipal);
      console.log('Montant Principal nettoyé:', cleanNumeric(this.dossierDetails.montantPrincipal));
      console.log('Intérêt Contractuel brut:', this.dossierDetails.interetContractuel);
      console.log('Intérêt Contractuel nettoyé:', cleanNumeric(this.dossierDetails.interetContractuel));
      console.log('Intérêt de Retard brut:', this.dossierDetails.interetRetard);
      console.log('Intérêt de Retard nettoyé:', cleanNumeric(this.dossierDetails.interetRetard));
      console.log('Engagement Total brut:', this.dossierDetails.engagementTotal);
      console.log('Engagement Total nettoyé:', cleanNumeric(this.dossierDetails.engagementTotal));
      console.log('Provision brut:', this.dossierDetails.provision);
      console.log('Provision nettoyé:', cleanNumeric(this.dossierDetails.provision));

      const fields = [
        { label: `ID Dossier`, value: this.dossierDetails.id },
        { label: `Numéro de Compte`, value: this.dossierDetails.compte.nomCompte },
        { label: `Engagement Total`, value: cleanNumeric(this.dossierDetails.engagementTotal) },
        { label: `Montant Principal`, value: cleanNumeric(this.dossierDetails.montantPrincipal) },
        { label: `Intérêt Contractuel`, value: cleanNumeric(this.dossierDetails.interetContractuel) },
        { label: `Intérêt de Retard`, value: cleanNumeric(this.dossierDetails.interetRetard) },
        { label: `Origines de l'engagement`, value: this.dossierDetails.naturesEngagement },
        { label: `Agence d'ouverture`, value: this.dossierDetails.agenceOuvertureCompte },
        { label: `Références Chèques`, value: this.dossierDetails.referencesChecks || 'Non spécifié' },
        { label: `Références Crédits`, value: this.dossierDetails.referencesCredits || 'Non spécifié' },
        { label: `Références Cautions`, value: this.dossierDetails.referencesCautions || 'Non spécifié' },
        { label: `Références LC`, value: this.dossierDetails.referencesLC || 'Non spécifié' },
        { label: `Provision`, value: cleanNumeric(this.dossierDetails.provision) },
        { label: `Garanties Valeur`, value: this.dossierDetails.garantiesValeur || 'Non spécifié' },
      ];

      // Affichage en grille 3 colonnes
      const colCount = 3;
      const colWidth = (pageWidth - 2 * margin) / colCount;
      for (let i = 0; i < fields.length; i += colCount) {
        for (let col = 0; col < colCount; col++) {
          const field = fields[i + col];
          if (!field) continue;
          const x = margin + col * colWidth;
          // Label
          doc.setFontSize(11);
          doc.setTextColor(120, 130, 140);
          doc.text(field.label, x, y);
          // Valeur
          doc.setFontSize(14);
          doc.setTextColor(33, 33, 33);
          doc.setFont('helvetica', 'bold');
          doc.text(String(field.value), x, y + 7);
          doc.setFont('helvetica', 'normal');
        }
        y += 18;
      }
      y += 5;

      // Statut et État de Validation (même style que les autres champs)
      doc.setFontSize(11);
      doc.setTextColor(120, 130, 140);
      doc.text('Status', margin, y);
      doc.text('État de Validation', margin + colWidth, y);
      // Valeurs
      doc.setFontSize(14);
      doc.setTextColor(33, 33, 33);
      doc.setFont('helvetica', 'bold');
      doc.text(this.dossierDetails.status || '', margin, y + 7);
      doc.text(this.dossierDetails.etatValidation || '', margin + colWidth, y + 7);
      doc.setFont('helvetica', 'normal');
      y += 18;

      // Section Commentaires (couleur inspirée du logo)
      doc.setFontSize(15);
      doc.setTextColor(50, 50, 50); // Gris foncé/noir inspiré du logo
      doc.text('Commentaires', margin, y);
      y += 8;
      // Tableau des commentaires
      const tableData = this.comments.map(comment => [
        this.formatDate(comment.createdAt),
        comment.content,
        comment.reminderDateTime ? this.formatDate(comment.reminderDateTime) : 'Non défini',
        comment.user?.name || 'Utilisateur inconnu'
      ]);
      autoTable(doc, {
        startY: y,
        head: [['DATE', 'COMMENTAIRE', 'DATE DE RAPPEL', 'UTILISATEUR']],
        body: tableData,
        theme: 'plain', // Utilisation du thème plain
        styles: {
          fontSize: 11,
          cellPadding: 5,
          halign: 'left',
          valign: 'top', // Aligner en haut pour les commentaires longs
          textColor: [50, 50, 50], // Texte gris foncé
          lineColor: [230, 230, 230], // Lignes très claires
          lineWidth: 0.2, // Lignes fines
        },
        headStyles: {
          textColor: [30, 64, 175], // Conserver la couleur bleue/grise de l'en-tête du tableau
          fontStyle: 'bold',
          fontSize: 12,
          halign: 'left',
          // Utiliser lineColor et lineWidth standards pour la ligne sous l'en-tête
          lineColor: [30, 64, 175], 
          lineWidth: 0.5, 
        },
        alternateRowStyles: {
          fillColor: [248, 248, 248] // Gris très clair pour les lignes alternées
        },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 85 }, // Ajusté légèrement pour le commentaire
          2: { cellWidth: 35 },
          3: { cellWidth: 30 }
        },
        margin: { top: 10 },
        // Supprimer didDrawCell, plain theme gère les lignes horizontales
      });

      // Pied de page
      const pageCount = doc.getNumberOfPages();
      const pageHeight = doc.internal.pageSize.getHeight();
      const footerY = pageHeight - 10; // Position Y pour le pied de page

      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);

        // Numéro de page (au centre)
        doc.text(
          `Page ${i} sur ${pageCount}`,
          pageWidth / 2,
          footerY,
          { align: 'center' }
        );
      }

      // Déplacer la date de génération ici, après le tableau
      const finalY = (doc as any).lastAutoTable.finalY || y; // Obtenir la position Y finale du tableau ou utiliser la dernière position connue
      const currentDate = new Date().toLocaleDateString('fr-FR'); // Obtenir la date formatée
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Généré le ${currentDate}`,
        pageWidth - margin,
        finalY + 10, // Ajouter un petit espace sous le tableau
        { align: 'right' }
      );
const blob = doc.output("blob"); // ou await doc.output("blob") selon ta version
this.dossierService.detailsPdfBlobs[this.dossierDetails.id] = blob;
      doc.save(`dossier_recouvrement_${this.dossierDetails.id}.pdf`);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Une erreur est survenue lors de la génération du PDF. Veuillez réessayer.');
    }
  }
  async generatePdfAsBlob(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.dossierDetails) {
          reject(new Error('Aucun dossier disponible pour la génération du PDF'));
          return;
        }
        
        // Code de génération du PDF (même que generatePDF mais sans téléchargement)
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        let y = margin; // Commencer au niveau de la marge

        // --- Configuration du Logo ---
        const logoPath = 'assets/logo.png'; // Chemin vers le logo
        const logoFormat = 'PNG'; 
        const logoWidth = 25; 
        const logoHeight = 25; 
        const logoX = margin; 
        const logoY = margin; 

        try {
          doc.addImage(logoPath, logoFormat, logoX, logoY, logoWidth, logoHeight);
        } catch (e) {
          console.error('Erreur lors de l\'ajout du logo:', e);
        }

        // Titre du document
        doc.setFontSize(24);
        doc.setTextColor(30, 64, 175);
        const titleX = logoPath && logoPath !== 'assets/logo.png' ? margin + logoWidth + 10 : pageWidth / 2;
        const titleAlign = logoPath && logoPath !== 'assets/logo.png' ? 'left' : 'center';
        doc.text('Dossier de Recouvrement', titleX, margin + (logoHeight > 0 ? logoHeight / 2 : 10), { align: titleAlign });

        doc.setTextColor(0, 0, 0);
        y = margin + (logoHeight > 0 ? logoHeight : 20) + 15;

        function cleanNumeric(val: any): string {
          if (typeof val === 'number') {
            return val.toLocaleString('fr-FR', { useGrouping: true, maximumFractionDigits: 0 });
          }
          if (typeof val === 'string') {
            const cleaned = val.replace(/[^0-9]/g, '');
            if (cleaned.length > 0) {
              return Number(cleaned).toLocaleString('fr-FR', { useGrouping: true, maximumFractionDigits: 0 });
            }
            return '';
          }
          return '';
        }

        // ... reste du code pour générer le PDF ...
        
        // Au lieu de télécharger le PDF, retourner un Blob
        const pdfBlob = doc.output('blob');
        resolve(pdfBlob);
      } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        reject(error);
      }
    });
  }

 


  async generateDetailsPdfAsBlob(dossier: DossierRecouvrement, comments: any[]): Promise<Blob> {
    return new Promise(async (resolve) => {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let y = margin;

      try {
        const logo = await this.loadImageBase64('assets/logo.png');
        doc.addImage(logo, 'PNG', margin, margin, 25, 25);
      } catch (e) {
        console.warn("⚠️ Erreur logo :", e);
      }

      doc.setFontSize(24);
      doc.setTextColor(30, 64, 175);
      doc.text('Dossier de Recouvrement', margin + 35, margin + 15);

      y += 50;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      const fields = [
        { label: 'ID Dossier', value: dossier.id },
        { label: 'Client', value: dossier.compte?.nomCompte },
        { label: 'Montant Principal', value: dossier.montantPrincipal },
        { label: 'Engagement Total', value: dossier.engagementTotal },
        { label: 'Provision', value: dossier.provision },
        { label: 'Status', value: dossier.status },
        { label: 'État', value: dossier.etatValidation }
      ];
      for (const field of fields) {
        doc.text(`${field.label} : ${field.value}`, margin, y);
        y += 10;
      }

      doc.setFontSize(14);
      doc.text('Commentaires', margin, y + 10);
      y += 18;

      const tableData = comments.map(c => [
        new Date(c.createdAt).toLocaleDateString('fr-FR'),
        c.content,
        c.reminderDateTime ? new Date(c.reminderDateTime).toLocaleDateString('fr-FR') : 'Non défini',
        c.user?.name || 'Utilisateur inconnu'
      ]);

      autoTable(doc, {
        startY: y,
        head: [['DATE', 'COMMENTAIRE', 'DATE DE RAPPEL', 'UTILISATEUR']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 10 }
      });

      const finalY = (doc as any).lastAutoTable?.finalY || y;
      const currentDate = new Date().toLocaleDateString('fr-FR');
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(`Généré le ${currentDate}`, pageWidth - margin, finalY + 10, { align: 'right' });

      resolve(doc.output("blob"));
    });
  }

  
  loadImageBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(xhr.response);
      };
      xhr.onerror = reject;
      xhr.open('GET', url);
      xhr.responseType = 'blob';
      xhr.send();
    });
  }

  downloadFile(dossier: DossierRecouvrement, type: string): void {
    if (!dossier.id) {
      alert('Aucun dossier sélectionné.');
      return;
    }

    let serviceCall;
    let fileName = 'file.pdf';

    switch (type) {
      case 'lc':
        if (dossier.lcFile) {
          // Use a placeholder service call since DossierRecouvrementService might not have download methods
          // In a real app, you would inject the correct service (e.g., LcFileService)
          alert('Téléchargement de fichier LC - À implémenter avec le service approprié');
          return;
        } else {
          alert('Aucun fichier LC associé à ce dossier.');
          return;
        }
      case 'caution':
        if (dossier.cautionsFile) {
          alert('Téléchargement de fichier de caution - À implémenter avec le service approprié');
          return;
        } else {
          alert('Aucun fichier de caution associé à ce dossier.');
          return;
        }
      case 'credit':
        if (dossier.creditsFile) {
          alert('Téléchargement de fichier de crédit - À implémenter avec le service approprié');
          return;
        } else {
          alert('Aucun fichier de crédit associé à ce dossier.');
          return;
        }
      default:
        alert('Type de fichier non reconnu.');
        return;
    }
  }
}