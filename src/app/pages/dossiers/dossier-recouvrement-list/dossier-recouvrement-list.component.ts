import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { RoleService } from '../../../shared/services/role.service';
import { DossierRecouvrementService } from '../../../shared/services/dossier-recouvrement.service';
import { DossierRecouvrement, EtatValidation } from '../../../shared/models/dossier-recouvrement.model';
import { AuthService } from 'src/app/auth/auth.service';
import { CreditsFileService } from 'src/app/shared/services/credits-file.service';
import { GarantieService } from 'src/app/shared/services/garantie.service';
import { Status } from '../../../shared/models/dossier-recouvrement.model';
import { firstValueFrom } from 'rxjs';
import jsPDF from 'jspdf';
import { CautionsFileManagementComponent } from '../../cautions-file-management/cautions-file-management.component';
import autoTable from 'jspdf-autotable';

import { HttpClient } from '@angular/common/http';
import { CautionsFileService } from 'src/app/shared/services/cautions-file.service';
import { UserService } from '../../../shared/services/user.service';
import { ConfirmationDialogComponent } from '../../../components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-dossier-recouvrement-list',
  templateUrl: './dossier-recouvrement-list.component.html',
  styleUrls: ['./dossier-recouvrement-list.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationDialogComponent]
})
export class DossierRecouvrementListComponent implements OnInit, OnDestroy {
  userType: string;
  canValidateDossier = false;
  selectedDossierForValidation: DossierRecouvrement | null = null;
  successMessage: string | null = null;
  showRejectDialog: boolean = false;
  rejectReason: string = '';
  selectedUsersForNotification: number[] = []; // IDs des utilisateurs sélectionnés
  selectedUserTypesForNotification: string[] = []; // Types d'utilisateurs sélectionnés
  usersByType: { [type: string]: any[] } = {}; // Utilisateurs groupés par type
  availableUserTypes: string[] = ['Do', 'Agence', 'Risque'];
  currentDossierForRejection: DossierRecouvrement | null = null;
  rejectDialogStep: number = 1; // Étape actuelle du dialogue (1, 2 ou 3)
  
  // Confirmation dialog properties
  showConfirmationDialog: boolean = false;
  confirmationDialogTitle: string = 'Confirmation de suppression';
  confirmationDialogMessage: string = 'Êtes-vous sûr de vouloir supprimer ce dossier?';
  dossierToDelete: number | null = null;

  statusEnum = EtatValidation; // Remplace etatValidationEnum

  dossiers: DossierRecouvrement[] = [];
  searchTerm: string = '';
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  isLoading = false;
  error: string | null = null;
  selectedFile: File | null = null; // Fichier sélectionné
  selectedDossierId: number | null = null; // ID du dossier sélectionné
  selectedPdfUrl: string | null = null;
  comments: any[] = [];


 dossier: DossierRecouvrement[] = [];        // Dossiers ACTIFS
  dossiersArchives: DossierRecouvrement[] = []; // Dossiers ARCHIVÉS
  currentView: 'actifs' | 'archives' = 'actifs'; // Pour savoir quelle vue est active


  constructor(private http: HttpClient,
    private dossierService: DossierRecouvrementService,
    public roleService: RoleService,
    private router: Router,
    private authService: AuthService,
    private cautionService: CautionsFileService,
    private creditService: CreditsFileService,
    private garantieService: GarantieService,
    private mergeService: DossierRecouvrementService,
    private userService: UserService
  )
   {
    this.searchSubject.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.performSearch(term);
    });
    this.userType = this.authService.getUserType(); // Récupérer le userType
    // Vérifier si l'utilisateur a le droit de valider des dossiers
    this.canValidateDossier = this.checkValidationPermission();
  }
formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('fr-FR'); // Ou format selon ton besoin
}

  ngOnInit(): void {

    if (this.currentView === 'actifs') {
      this.loadDossiers();
    } else {
      this.loadDossiersArchives();
    }
    this.loadDossiers();
    this.loadDossiersArchives();

    
    // Ajouter un gestionnaire d'événements pour fermer le menu lors d'un clic à l'extérieur
    document.addEventListener('click', this.closeValidationMenu.bind(this));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // Nettoyer le gestionnaire d'événements
    document.removeEventListener('click', this.closeValidationMenu.bind(this));
  }
 

  /**
   * Désarchive un dossier
   */
 
  retournerAuxDossiers(): void {
    this.router.navigate(['/dossiers']);
  }
loadDossiersArchives(): void {
    this.isLoading = true;
    console.log("🔄 Chargement des dossiers ARCHIVÉS...");
    this.dossierService.getDossiersArchives().subscribe({
      next: (data) => {
        console.log("✅ Dossiers archivés reçus:", data.length, "dossiers");
        this.dossiersArchives = data; // ✅ CORRECTION: Utiliser dossiersArchives
        this.isLoading = false;
      },
      error: (err) => {
        console.error("❌ Erreur chargement dossiers archivés:", err);
        this.error = 'Erreur lors du chargement des archives';
        this.isLoading = false;
      }
    });
  }

  

  // ✅ CORRECTION 3: loadDossiers() reste identique
  loadDossiers(): void {
    this.isLoading = true;
    console.log("➡️ Chargement des dossiers ACTIFS...");
    this.dossierService.getDossiersActifs().subscribe({
      next: (data) => {
        console.log("✅ Dossiers actifs reçus :", data);
        this.dossiers = data; // 👈 Pour les dossiers ACTIFS
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Erreur de chargement';
        this.isLoading = false;
      }
    });
  }
  onSearchChange(event: any) {
    const term = event.target.value;
    this.searchSubject.next(term);
  }

  private performSearch(term : string ) {
    if (!term.trim()) {
      this.loadDossiers();
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.dossierService.searchDossiers({ nomClient: term }).subscribe({
      next: (data) => {
        this.dossiers = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur de recherche', err);
        this.error = typeof err === 'string' ? err : 'Une erreur est survenue lors de la recherche';
        this.isLoading = false;
      }
    });
  }

  navigateToDetails(dossierId: number) {
    if (dossierId) {
      this.router.navigate(['dossiers/view/', dossierId]);
    }
  }

  navigateToEdit(dossierId: number) {
    if (dossierId) {
      this.router.navigate(['dossier-recouvrement/modify/', dossierId]);
    }
  }

  navigateToAdd() {
    this.router.navigate(['/dossiers/add']);
  }

  deleteDossier(dossierId: number) {
    this.dossierToDelete = dossierId;
    this.showConfirmationDialog = true;
  }

  confirmDeleteDossier() {
    if (this.dossierToDelete) {
      this.isLoading = true;
      this.dossierService.deleteDossier(this.dossierToDelete).subscribe({
        next: (response) => {
          console.log('Dossier supprimé avec succès', response);
          this.successMessage = 'Dossier supprimé avec succès';
          this.error = null;
          this.loadDossiers();
          this.isLoading = false;
          // Clear success message after 3 seconds
          setTimeout(() => {
            this.successMessage = null;
          }, 3000);
        },
        error: (err) => {
          console.error('Erreur de suppression', err);
          this.error = 'Une erreur est survenue lors de la suppression';
          this.successMessage = null;
          this.isLoading = false;
        }
      });
      this.cancelDeleteDossier();
    }
  }

  cancelDeleteDossier() {
    this.showConfirmationDialog = false;
    this.dossierToDelete = null;
  }

  getValidationStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Initiale': 'pending',
      'Validé': 'active',
      'Non Validé': 'closed'
    };
    return statusMap[status] || 'pending';
  }

  onFileUpload(event: any): void {
    const file: File = event.target.files[0];
    if (!file) {
      this.error = 'Aucun fichier sélectionné.';
      return;
    }
  
    if (!file.name.endsWith('.csv')) {
      this.error = 'Le fichier doit être au format CSV.';
      return;
    }
  
    const formData = new FormData();
    formData.append('file', file);
  
    this.isLoading = true;
    this.error = null;
  
    this.dossierService.importDossiers(file).subscribe({
      next: (response: any) => {
        this.loadDossiers();
        this.isLoading = false;
        this.error = null;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur lors de l\'upload du fichier CSV :', err);
  
        // Gestion améliorée des erreurs
        if (err.error) {
          if (typeof err.error === 'string') {
            // Si l'erreur est une chaîne de caractères
            this.error = err.error;
          } else if (err.error.message) {
            // Si l'erreur est un objet avec une propriété 'message'
            this.error = err.error.message;
          } else {
            // Si l'erreur est un objet sans propriété 'message'
            this.error = 'Une erreur est survenue lors de l\'upload.';
          }
        } else {
          // Si l'erreur est une erreur réseau ou serveur
          this.error = 'Une erreur est survenue lors de l\'upload.';
        }
  
        this.isLoading = false;
      }
    });
  }
  getAlertIcon(type: 'success' | 'error'): string {
    const iconMap: Record<'success' | 'error', string> = {
      'success': 'check_circle',
      'error': 'error'
    };
    return iconMap[type];
  }

  telechargerMiseEnDemeure(dossier: DossierRecouvrement): void {
    this.dossierService.genererMiseEnDemeure(dossier);
  }

  /**
   * Vérifie si l'utilisateur courant a le droit de valider des dossiers
   */
  checkValidationPermission(): boolean {
    // Pour le test, autoriser tous les utilisateurs à valider des dossiers
    return true; // Tous les utilisateurs peuvent valider les dossiers pour le test
  }

  /**
   * Ouvre le menu de validation pour un dossier spécifique
   */
  openValidationMenu(dossier: DossierRecouvrement, event: MouseEvent | KeyboardEvent): void {
    this.selectedDossierForValidation = dossier; // Set the selected dossier for validation
    // Stop propagation to prevent immediate closing from document click
    event.stopPropagation();
  }

  /**
   * Ferme le menu de validation lors d'un clic à l'extérieur
   */
  closeValidationMenu(event: MouseEvent): void {
    // Check if the click occurred inside the validation menu or on its trigger button
    // If it's a click outside, then close the menu.
    const target = event.target as HTMLElement;
    if (!target.closest('.validation-menu') && !target.closest('.status-chip.clickable')) {
      this.selectedDossierForValidation = null;
    }
  }

  /**
   * Valide ou refuse un dossier
   */
  validateDossier(dossier: DossierRecouvrement, newState: 'VALIDE' | 'NON_VALIDE'): void {
    if (newState === 'NON_VALIDE') {
      this.openRejectDialog(dossier);
    } else {
      this.isLoading = true;
      this.error = null;
      
      // Créer un commentaire basé sur l'action
      const commentContent = newState === 'VALIDE' 
        ? 'Dossier accepté' 
        : 'Dossier refusé'; // This line will not be reached for NON_VALIDE anymore
      
      // Mettre à jour l'état du dossier
      const updatedDossier = { ...dossier, etatValidation: newState as EtatValidation };
      
      // Appeler le service pour mettre à jour le dossier
      this.dossierService.updateDossier(dossier.id, updatedDossier).subscribe({
        next: (response) => {
          // Ajouter un commentaire au dossier
          this.dossierService.addComment(dossier.id, commentContent, null).subscribe({
            next: () => {
              this.loadDossiers(); // Recharger la liste après la mise à jour
              this.selectedDossierForValidation = null; // Fermer le menu
              
              // Afficher un message de succès approprié
              if (newState === 'VALIDE') {
                this.successMessage = `Le dossier #${dossier.id} a été accepté avec succès`;
              } else {
                this.successMessage = `Le dossier #${dossier.id} a été refusé avec succès`;
              }
              
              // Masquer le message après 5 secondes
              this.hideSuccessMessageAfterDelay();
            },
            error: (err) => {
              console.error('Erreur lors de l\'ajout du commentaire:', err);
              // L'état a été mis à jour, donc on recharge quand même les dossiers
              this.loadDossiers();
              this.selectedDossierForValidation = null;
            }
          });
        },
        error: (err: HttpErrorResponse) => {
          console.error('Erreur lors de la validation du dossier:', err);
          if (err.error) {
            if (typeof err.error === 'string') {
              this.error = err.error;
            } else if (err.error.message) {
              this.error = err.error.message;
            } else {
              this.error = 'Une erreur est survenue lors de la validation du dossier. Code: ' + err.status;
            }
          } else if (err.message) {
            this.error = err.message;
          } else {
            this.error = 'Une erreur est survenue lors de la validation du dossier. Veuillez vérifier la console pour plus de détails.';
          }
          this.isLoading = false;
        }
      });
    }
  }
  
  /**
   * Masque le message de succès après un délai
   */
  hideSuccessMessageAfterDelay(delay: number = 5000): void {
    setTimeout(() => {
      this.successMessage = null;
    }, delay);
  }
 

// Dans votre composant - Version améliorée avec débogage

/**
 * Télécharge tous les documents fusionnés incluant chèque et LC
 * Version avec gestion d'erreurs améliorée
 */
async downloadAllDocumentsFusionnes(dossier: DossierRecouvrement): Promise<void> {
  console.log('🚀 Début de la génération du PDF complet pour le dossier:', dossier.id);
  this.isLoading = true;
  
  try {
    // Étape 1: Vérifier les fichiers disponibles
    console.log('📋 Vérification des fichiers disponibles...');
    try {
      const filesStatus = await firstValueFrom(
        this.dossierService.getAvailableFiles(dossier.id)
      );
      console.log('✅ Status des fichiers:', filesStatus);
      
      if (!filesStatus.canMerge) {
        throw new Error('Les fichiers obligatoires (garanties, crédits, cautions) ne sont pas tous présents');
      }
    } catch (statusError) {
      console.warn('⚠️ Impossible de vérifier le statut des fichiers, continuation...', statusError);
    }
    
    // Étape 2: Générer les PDFs côté frontend
    console.log('📄 Génération du PDF détails...');
    const detailsBlob = await this.generateDetailsPdfAsBlob(dossier);
    console.log('✅ PDF détails généré, taille:', detailsBlob.size, 'bytes');
    
    console.log('📄 Génération du PDF mise en demeure...');
    const miseBlob = await this.generateMiseEnDemeurePdfAsBlob(dossier);
    console.log('✅ PDF mise en demeure généré, taille:', miseBlob.size, 'bytes');
    
    // Vérification des blobs générés
    if (!detailsBlob || detailsBlob.size === 0) {
      throw new Error('Le PDF détails n\'a pas pu être généré correctement');
    }
    
    if (!miseBlob || miseBlob.size === 0) {
      throw new Error('Le PDF mise en demeure n\'a pas pu être généré correctement');
    }
    
    // Étape 3: Effectuer la fusion complète
    console.log('🔄 Lancement de la fusion complète...');
    const fusionBlob = await firstValueFrom(
      this.dossierService.fusionnerTout(dossier.id, detailsBlob, miseBlob)
    );
    
    console.log('✅ Fusion réussie, taille du fichier final:', fusionBlob.size, 'bytes');
    
    // Étape 4: Télécharger le fichier fusionné
    if (!fusionBlob || fusionBlob.size === 0) {
      throw new Error('Le fichier fusionné est vide ou invalide');
    }
    
    const url = window.URL.createObjectURL(fusionBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dossier-complet-${dossier.id}-${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Ajouter le lien au DOM temporairement pour le téléchargement
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Nettoyer l'URL créée
    window.URL.revokeObjectURL(url);
    
    console.log('✅ Téléchargement du dossier complet réussi');
    this.showSuccessMessage('PDF complet généré et téléchargé avec succès');
    
  } catch (error: any) {
    console.error("❌ Erreur détaillée lors de la fusion des fichiers:", error);
    
    // Gestion spécifique des types d'erreurs
    let errorMessage = 'Erreur lors de la génération du PDF complet';
    
    if (error?.status === 404) {
      errorMessage = 'Dossier ou fichiers requis introuvables';
    } else if (error?.status === 500) {
      errorMessage = 'Erreur serveur lors de la fusion des PDFs';
    } else if (error?.status === 0) {
      errorMessage = 'Erreur de connexion au serveur';
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    this.showErrorMessage(errorMessage);
    
    // Log pour le débogage
    console.error('Détails de l\'erreur:', {
      message: error?.message,
      status: error?.status,
      url: error?.url,
      stack: error?.stack
    });
    
  } finally {
    this.isLoading = false;
    console.log('🏁 Fin du processus de génération PDF');
  }
}

/**
 * Vérifie si les méthodes de génération PDF existent et fonctionnent
 */
private async validatePdfGenerationMethods(dossier: DossierRecouvrement): Promise<boolean> {
  try {
    console.log('🔍 Validation des méthodes de génération PDF...');
    
    // Vérifier que les méthodes existent
    if (typeof this.generateDetailsPdfAsBlob !== 'function') {
      console.error('❌ Méthode generateDetailsPdfAsBlob non trouvée');
      return false;
    }
    
    if (typeof this.generateMiseEnDemeurePdfAsBlob !== 'function') {
      console.error('❌ Méthode generateMiseEnDemeurePdfAsBlob non trouvée');
      return false;
    }
    
    console.log('✅ Méthodes de génération PDF validées');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors de la validation des méthodes PDF:', error);
    return false;
  }
}

/**
 * Version alternative avec validation préalable
 */
async downloadAllDocumentsFusionnesSecure(dossier: DossierRecouvrement): Promise<void> {
  console.log('🔒 Début de la génération sécurisée du PDF complet');
  
  // Validation préalable
  const isValid = await this.validatePdfGenerationMethods(dossier);
  if (!isValid) {
    this.showErrorMessage('Les méthodes de génération PDF ne sont pas disponibles');
    return;
  }
  
  // Continuer avec la génération normale
  return this.downloadAllDocumentsFusionnes(dossier);
}

/**
 * Méthodes pour afficher les messages (à adapter selon votre système)
 */
private showErrorMessage(message: string): void {
  console.error('🚨 ' + message);
  // Implémentez selon votre système de notifications
  // Exemples possibles:
  // this.toastr.error(message);
  // this.snackBar.open(message, 'Fermer', { duration: 5000 });
  // this.notificationService.showError(message);
}

private showSuccessMessage(message: string): void {
  console.log('✅ ' + message);
  // Implémentez selon votre système de notifications
  // Exemples possibles:
  // this.toastr.success(message);
  // this.snackBar.open(message, 'Fermer', { duration: 3000 });
  // this.notificationService.showSuccess(message);
}

/**
 * Méthode de test pour vérifier la connectivité avec le backend
 */
async testBackendConnectivity(dossierId: number): Promise<void> {
  try {
    console.log('🔗 Test de connectivité backend...');
    
    const response = await firstValueFrom(
      this.dossierService.getAvailableFiles(dossierId)
    );
    
    console.log('✅ Backend accessible, réponse:', response);
    
  } catch (error) {
    console.error('❌ Backend inaccessible:', error);
    this.showErrorMessage('Impossible de communiquer avec le serveur');
  }
}
/**
 * Vérifie et affiche l'état des fichiers disponibles
 */
async checkFilesStatus(dossierId: number): Promise<void> {
  try {
    const status = await firstValueFrom(
      this.dossierService.getAvailableFiles(dossierId)
    );
    
    console.log('📊 État des fichiers:');
    console.log('- Garanties:', status.garanties ? '✅' : '❌');
    console.log('- Crédits:', status.credits ? '✅' : '❌');
    console.log('- Cautions:', status.cautions ? '✅' : '❌');
    console.log('- Chèque:', status.cheque ? '✅' : '❌');
    console.log('- LC:', status.lc ? '✅' : '❌');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des fichiers:', error);
  }
}

   
/**
 * Génère un PDF des détails du dossier et retourne un Blob
 * Compatible avec le système de fusion
 */
async generateDetailsPdfAsBlob(dossier: DossierRecouvrement): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      if (!dossier) {
        reject(new Error('Aucun dossier disponible pour la génération du PDF'));
        return;
      }

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let y = margin;

      // --- Configuration du Logo ---
      const logoPath = 'assets/logo.png';
      const logoFormat = 'PNG';
      const logoWidth = 25;
      const logoHeight = 25;
      const logoX = margin;
      const logoY = margin;

      try {
        // Chargement asynchrone du logo en base64
        const logoBase64 = await this.loadImageBase64(logoPath);
        doc.addImage(logoBase64, logoFormat, logoX, logoY, logoWidth, logoHeight);
      } catch (e) {
        console.warn('⚠️ Erreur lors du chargement du logo:', e);
        // Continuer sans logo
      }

      // Titre du document
      doc.setFontSize(24);
      doc.setTextColor(30, 64, 175);
      const titleX = margin + logoWidth + 10;
      doc.text('Dossier de Recouvrement', titleX, margin + 12);

      doc.setTextColor(0, 0, 0);
      y = margin + logoHeight + 15;

      // Fonction pour nettoyer les valeurs numériques
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
        return val ? String(val) : '';
      }

      // Préparation des données pour la grille 3 colonnes
      const fields = [
        { label: 'ID Dossier', value: dossier.id },
        { label: 'Numéro de Compte', value: dossier.compte?.nomCompte || 'N/A' },
        { label: 'Engagement Total', value: cleanNumeric(dossier.engagementTotal) },
        { label: 'Montant Principal', value: cleanNumeric(dossier.montantPrincipal) },
        { label: 'Intérêt Contractuel', value: cleanNumeric(dossier.interetContractuel) },
        { label: 'Intérêt de Retard', value: cleanNumeric(dossier.interetRetard) },
        { label: 'Origines de l\'engagement', value: dossier.naturesEngagement || 'Non spécifié' },
        { label: 'Agence d\'ouverture', value: dossier.agenceOuvertureCompte || 'Non spécifié' },
        { label: 'Références Chèques', value: dossier.referencesChecks || 'Non spécifié' },
        { label: 'Références Crédits', value: dossier.referencesCredits || 'Non spécifié' },
        { label: 'Références Cautions', value: dossier.referencesCautions || 'Non spécifié' },
        { label: 'Références LC', value: dossier.referencesLC || 'Non spécifié' },
        { label: 'Provision', value: cleanNumeric(dossier.provision) },
        { label: 'Garanties Valeur', value: dossier.garantiesValeur || 'Non spécifié' },
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

      // Statut et État de Validation
      doc.setFontSize(11);
      doc.setTextColor(120, 130, 140);
      doc.text('Status', margin, y);
      doc.text('État de Validation', margin + colWidth, y);
      
      // Valeurs
      doc.setFontSize(14);
      doc.setTextColor(33, 33, 33);
      doc.setFont('helvetica', 'bold');
      doc.text(dossier.etatValidation || 'Non défini', margin, y + 7);
      doc.setFont('helvetica', 'normal');
      y += 18;

      // Section Commentaires
      doc.setFontSize(15);
      doc.setTextColor(50, 50, 50);
      doc.text('Commentaires', margin, y);
      y += 8;

      // Utiliser les commentaires du composant
      const comments = this.comments || [];
      
      // Tableau des commentaires
      const tableData = comments.map(comment => [
        this.formatDate(comment.createdAt),
        comment.content,
        comment.reminderDateTime ? this.formatDate(comment.reminderDateTime) : 'Non défini',
        comment.user?.name || 'Utilisateur inconnu'
      ]);

      autoTable(doc, {
        startY: y,
        head: [['DATE', 'COMMENTAIRE', 'DATE DE RAPPEL', 'UTILISATEUR']],
        body: tableData,
        theme: 'plain',
        styles: {
          fontSize: 11,
          cellPadding: 5,
          halign: 'left',
          valign: 'top',
          textColor: [50, 50, 50],
          lineColor: [230, 230, 230],
          lineWidth: 0.2,
        },
        headStyles: {
          textColor: [30, 64, 175],
          fontStyle: 'bold',
          fontSize: 12,
          halign: 'left',
          lineColor: [30, 64, 175],
          lineWidth: 0.5,
        },
        alternateRowStyles: {
          fillColor: [248, 248, 248]
        },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 85 },
          2: { cellWidth: 35 },
          3: { cellWidth: 30 }
        },
        margin: { top: 10 },
      });

      // Pied de page avec date de génération
      const finalY = (doc as any).lastAutoTable?.finalY || y;
      const currentDate = new Date().toLocaleDateString('fr-FR');
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Généré le ${currentDate}`,
        pageWidth - margin,
        finalY + 10,
        { align: 'right' }
      );

      // Numérotation des pages
      const pageCount = doc.getNumberOfPages();
      const pageHeight = doc.internal.pageSize.getHeight();
      const footerY = pageHeight - 10;

      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Page ${i} sur ${pageCount}`,
          pageWidth / 2,
          footerY,
          { align: 'center' }
        );
      }

      // Retourner le blob
      const pdfBlob = doc.output('blob');
      
      // Stocker le blob dans le service si nécessaire
      if (this.dossierService.detailsPdfBlobs) {
        this.dossierService.detailsPdfBlobs[dossier.id] = pdfBlob;
      }
      
      console.log('✅ PDF détails généré comme blob, taille:', pdfBlob.size, 'bytes');
      resolve(pdfBlob);
      
    } catch (error) {
      console.error('❌ Erreur lors de la génération du PDF détails:', error);
      reject(error);
    }
  });
}

/**
 * Génère un PDF de mise en demeure et retourne un Blob
 * Compatible avec le système de fusion
 */
async generateMiseEnDemeurePdfAsBlob(dossier: DossierRecouvrement): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      if (!dossier) {
        reject(new Error('Aucun dossier disponible pour la génération du PDF'));
        return;
      }

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let y = margin;

      // --- Logo ---
      try {
        const logoBase64 = await this.loadImageBase64('assets/logo.png');
        doc.addImage(logoBase64, 'PNG', margin, margin, 25, 25);
      } catch (e) {
        console.warn('⚠️ Logo non chargé pour mise en demeure:', e);
      }

      // En-tête
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(30, 64, 175);
      doc.text('MISE EN DEMEURE DE PAIEMENT', pageWidth / 2, y + 15, { align: 'center' });

      y += 50;

      // Informations générales
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);

      const currentDate = new Date().toLocaleDateString('fr-FR');
      doc.text(`Date: ${currentDate}`, margin, y);
      y += 10;
      doc.text(`Référence dossier: ${dossier.id}`, margin, y);
      y += 10;
      doc.text(`Client: ${dossier.compte?.nomCompte || 'N/A'}`, margin, y);
      y += 20;

      // Corps de la lettre
      doc.setFont('helvetica', 'bold');
      doc.text('Madame, Monsieur,', margin, y);
      y += 15;

      doc.setFont('helvetica', 'normal');
      const textContent = [
        `Nous vous informons que malgré nos relances précédentes, la somme de ${this.formatAmount(dossier.montantPrincipal)} € reste impayée à ce jour.`,
        '',
        'Cette créance concerne :',
        `- Montant principal : ${this.formatAmount(dossier.montantPrincipal)} €`,
        `- Intérêts contractuels : ${this.formatAmount(dossier.interetContractuel)} €`,
        `- Intérêts de retard : ${this.formatAmount(dossier.interetRetard)} €`,
        `- TOTAL DÛ : ${this.formatAmount(dossier.engagementTotal)} €`,
        '',
        'En conséquence, nous vous METTONS EN DEMEURE de procéder au règlement intégral de cette somme dans un délai de QUINZE (15) JOURS à compter de la réception de la présente.',
        '',
        'À défaut de paiement dans ce délai, nous nous verrons contraints d\'engager contre vous toutes les actions légales nécessaires au recouvrement de notre créance, sans autre mise en demeure.',
        '',
        'Nous vous rappelons que ces poursuites entraîneront des frais supplémentaires qui resteront à votre charge.',
        '',
        'Dans l\'attente de votre règlement, nous vous prions d\'agréer, Madame, Monsieur, l\'expression de nos salutations distinguées.'
      ];

      for (const line of textContent) {
        if (line === '') {
          y += 8;
        } else {
          const splitText = doc.splitTextToSize(line, pageWidth - 2 * margin);
          doc.text(splitText, margin, y);
          y += splitText.length * 6;
        }
      }

      y += 20;
      doc.setFont('helvetica', 'bold');
      doc.text('Service Recouvrement', margin, y);

      // Pied de page
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Document généré le ${currentDate}`,
        pageWidth / 2,
        pageHeight - 15,
        { align: 'center' }
      );

      const pdfBlob = doc.output('blob');
      console.log('✅ PDF mise en demeure généré comme blob, taille:', pdfBlob.size, 'bytes');
      resolve(pdfBlob);

    } catch (error) {
      console.error('❌ Erreur lors de la génération du PDF mise en demeure:', error);
      reject(error);
    }
  });
}

/**
 * Méthode utilitaire pour formater les montants
 */
private formatAmount(amount: any): string {
  if (typeof amount === 'number') {
    return amount.toLocaleString('fr-FR', { 
      useGrouping: true, 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    });
  }
  if (typeof amount === 'string') {
    const cleaned = amount.replace(/[^0-9.]/g, '');
    if (cleaned.length > 0) {
      return Number(cleaned).toLocaleString('fr-FR', { 
        useGrouping: true, 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      });
    }
  }
  return '0,00';
}

/**
 * Méthode utilitaire pour charger une image en base64
 * (déjà présente dans votre code, mais voici une version améliorée)
 */
private loadImageBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      if (xhr.status === 200) {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
        reader.readAsDataURL(xhr.response);
      } else {
        reject(new Error(`Erreur HTTP: ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error('Erreur réseau'));
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  });
}


// ✅ SOLUTION CORRIGÉE: Archivage avec gestion correcte des listes

archiverDossierAvecRechargement(id: number): void {
  if (confirm("Voulez-vous vraiment archiver ce dossier ?")) {
    // 🟡 ÉTAPE 1: Sauvegarder le dossier avant archivage
    const dossierToArchive = this.dossiers.find(d => d.id === id);
    
    this.dossierService.archiverDossier(id).subscribe({
      next: (dossierArchive) => {
        console.log("✅ Dossier archivé avec succès");
        
        // 🟡 ÉTAPE 2: Supprimer de la liste des ACTIFS
        this.dossiers = this.dossiers.filter(d => d.id !== id);
        console.log("📋 Dossiers actifs après suppression:", this.dossiers.length);
        
        // 🟡 ÉTAPE 3: Ajouter aux ARCHIVES
        if (dossierArchive) {
          // Utiliser le dossier retourné par le serveur
          this.dossiersArchives.push(dossierArchive);
        } else if (dossierToArchive) {
          // Fallback: utiliser le dossier original avec statut modifié
          const archivedDossier = { ...dossierToArchive, status: this.statusEnum.ARCHIVEE };
          this.dossiersArchives.push(archivedDossier);
        }
        
        console.log("🗃️ Dossiers archivés après ajout:", this.dossiersArchives.length);
        
        // 🟡 ÉTAPE 4: Afficher message de succès
        this.successMessage = "Dossier archivé avec succès !";
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (error) => {
        console.error("❌ Erreur lors de l'archivage :", error);
        this.error = "Erreur lors de l'archivage du dossier.";
        setTimeout(() => this.error = null, 5000);
      }
    });
  }
}

desarchiverDossierAvecRechargement(id: number): void {
  if (confirm("Voulez-vous vraiment désarchiver ce dossier ?")) {
    // 🟡 ÉTAPE 1: Sauvegarder le dossier avant désarchivage
    const dossierToRestore = this.dossiersArchives.find(d => d.id === id);
    
    this.dossierService.desarchiverDossier(id).subscribe({
      next: (dossierDesarchive) => {
        console.log("✅ Dossier désarchivé avec succès");
        
        // 🟡 ÉTAPE 2: Supprimer des ARCHIVES
        this.dossiersArchives = this.dossiersArchives.filter(d => d.id !== id);
        console.log("🗃️ Dossiers archivés après suppression:", this.dossiersArchives.length);
        
        // 🟡 ÉTAPE 3: Ajouter aux ACTIFS
        if (dossierDesarchive) {
          // Utiliser le dossier retourné par le serveur
          this.dossiers.push(dossierDesarchive);
        } else if (dossierToRestore) {
          // Fallback: utiliser le dossier original avec statut modifié
          const restoredDossier = { ...dossierToRestore, status: 'EN_COURS' };
          this.dossiers.push(restoredDossier);
        }
        
        console.log("📋 Dossiers actifs après ajout:", this.dossiers.length);
        
        // 🟡 ÉTAPE 4: Afficher message de succès
        this.successMessage = "Dossier désarchivé avec succès !";
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (error) => {
        console.error("❌ Erreur lors du désarchivage :", error);
        this.error = "Erreur lors du désarchivage du dossier.";
        setTimeout(() => this.error = null, 5000);
      }
    });
  }
}

// ✅ MÉTHODE ALTERNATIVE: Si vous préférez recharger depuis le serveur
archiverDossierAvecRechargementServeur(id: number): void {
  if (confirm("Voulez-vous vraiment archiver ce dossier ?")) {
    this.dossierService.archiverDossier(id).subscribe({
      next: () => {
        console.log("✅ Archivage OK, rechargement des deux listes");
        
        // Recharger les deux listes depuis le serveur
        this.loadDossiers();        // Recharge les dossiers actifs
        this.loadDossiersArchives(); // Recharge les dossiers archivés
        
        this.successMessage = "Dossier archivé avec succès !";
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (error) => {
        console.error("❌ Erreur lors de l'archivage :", error);
        this.error = "Erreur lors de l'archivage du dossier.";
        setTimeout(() => this.error = null, 5000);
      }
    });
  }
}

desarchiverDossierAvecRechargementServeur(id: number): void {
  if (confirm("Voulez-vous vraiment désarchiver ce dossier ?")) {
    this.dossierService.desarchiverDossier(id).subscribe({
      next: () => {
        console.log("✅ Désarchivage OK, rechargement des deux listes");
        
        // Recharger les deux listes depuis le serveur
        this.loadDossiers();        // Recharge les dossiers actifs
        this.loadDossiersArchives(); // Recharge les dossiers archivés
        
        this.successMessage = "Dossier désarchivé avec succès !";
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (error) => {
        console.error("❌ Erreur lors du désarchivage :", error);
        this.error = "Erreur lors du désarchivage du dossier.";
        setTimeout(() => this.error = null, 5000);
      }
    });
  }
}

// ✅ MÉTHODE DE DEBUG pour vérifier l'état des listes
debugListes(): void {
  console.log("🔍 DEBUG - État des listes:");
  console.log("📋 Dossiers actifs:", this.dossiers.length, this.dossiers.map(d => ({id: d.id, status: d.status})));
  console.log("🗃️ Dossiers archivés:", this.dossiersArchives.length, this.dossiersArchives.map(d => ({id: d.id, status: d.status})));
  console.log("👁️ Vue courante:", this.currentView);
}



// Méthodes à ajouter dans votre composant

/**
 * Affiche la vue des dossiers actifs
 */
voirDossiersActifs(): void {
  this.currentView = 'actifs';
  this.loadDossiers(); // Recharge les dossiers actifs
}

/**
 * Affiche la vue des dossiers archivés
 */
voirDossiersArchives(): void {
  this.currentView = 'archives';
  this.loadDossiersArchives(); // Charge les dossiers archivés
}

openRejectDialog(dossier: DossierRecouvrement): void {
  this.currentDossierForRejection = dossier;
  this.rejectReason = ''; // Reset reason
  this.selectedUserTypesForNotification = []; // Reset selected user types
  this.selectedUsersForNotification = []; // Reset selected users
  this.usersByType = {}; // Reset users by type
  this.rejectDialogStep = 1; // Reset to first step
  this.showRejectDialog = true;
  this.selectedDossierForValidation = null; // Close the validation menu
}

onUserTypeChange(userType: string, event: any): void {
  if (event.target.checked) {
    this.selectedUserTypesForNotification.push(userType);
  } else {
    this.selectedUserTypesForNotification = this.selectedUserTypesForNotification.filter(type => type !== userType);
    // Supprimer également les utilisateurs de ce type qui ont été sélectionnés
    this.selectedUsersForNotification = this.selectedUsersForNotification.filter(userId => {
      const user = this.findUserById(userId);
      return user && !user.userType.includes(userType);
    });
  }
}

// Trouver un utilisateur par son ID
findUserById(userId: number): any {
  for (const type in this.usersByType) {
    const user = this.usersByType[type].find(u => u.id === userId);
    if (user) return user;
  }
  return null;
}

// Charger les utilisateurs par type
loadUsersByTypes(): void {
  if (this.selectedUserTypesForNotification.length === 0) {
    this.usersByType = {};
    return;
  }
  
  this.isLoading = true;
  this.userService.getUsersByTypes(this.selectedUserTypesForNotification).subscribe({
    next: (users) => {
      // Grouper les utilisateurs par type
      this.usersByType = {};
      users.forEach(user => {
        if (!this.usersByType[user.userType]) {
          this.usersByType[user.userType] = [];
        }
        this.usersByType[user.userType].push(user);
      });
      this.isLoading = false;
    },
    error: (error) => {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      this.error = 'Erreur lors du chargement des utilisateurs. Veuillez réessayer.';
      this.isLoading = false;
    }
  });
}

// Gérer la sélection d'un utilisateur
onUserSelectionChange(userId: number, event: any): void {
  if (event.target.checked) {
    if (!this.selectedUsersForNotification.includes(userId)) {
      this.selectedUsersForNotification.push(userId);
    }
  } else {
    this.selectedUsersForNotification = this.selectedUsersForNotification.filter(id => id !== userId);
  }
}

// Passer à l'étape suivante du dialogue
nextRejectStep(): void {
  if (this.rejectDialogStep === 1) {
    // Vérifier si au moins un type d'utilisateur est sélectionné
    if (this.selectedUserTypesForNotification.length === 0) {
      this.error = 'Veuillez sélectionner au moins un type d\'utilisateur.';
      setTimeout(() => this.error = null, 3000);
      return;
    }
    // Charger les utilisateurs pour les types sélectionnés
    this.loadUsersByTypes();
    this.rejectDialogStep = 2;
  } else if (this.rejectDialogStep === 2) {
    // Vérifier si au moins un utilisateur est sélectionné
    if (this.selectedUsersForNotification.length === 0) {
      this.error = 'Veuillez sélectionner au moins un utilisateur à notifier.';
      setTimeout(() => this.error = null, 3000);
      return;
    }
    this.rejectDialogStep = 3;
  }
}

// Revenir à l'étape précédente
previousRejectStep(): void {
  if (this.rejectDialogStep > 1) {
    this.rejectDialogStep--;
  }
}

confirmRejectDossier(): void {
  if (!this.currentDossierForRejection) return;
  
  // Vérifier si un motif est saisi
  if (!this.rejectReason.trim()) {
    this.error = 'Veuillez saisir un motif de rejet.';
    setTimeout(() => this.error = null, 3000);
    return;
  }

  this.isLoading = true;
  this.error = null;

  const dossierId = this.currentDossierForRejection.id;
  const updatedDossier = { ...this.currentDossierForRejection, etatValidation: EtatValidation.NON_VALIDE };

  // First, update the dossier status
  this.dossierService.updateDossier(dossierId, updatedDossier).subscribe({
    next: () => {
      // Then, create rejection with notifications to selected users
      console.log(`Rejet créé pour le dossier ${dossierId} avec motif: ${this.rejectReason}`);
      console.log(`Types d'utilisateurs: ${this.selectedUserTypesForNotification.join(', ')}`);
      console.log(`Utilisateurs sélectionnés: ${this.selectedUsersForNotification.join(', ')}`);
      
      this.dossierService.createRejet(
        dossierId, 
        this.rejectReason, 
        this.selectedUserTypesForNotification, 
        this.selectedUsersForNotification
      ).subscribe({
        next: () => {
          console.log('Rejet créé et notifications envoyées avec succès!');
          this.loadDossiers();
          this.showRejectDialog = false; // Close the dialog
          this.successMessage = `Le dossier #${dossierId} a été refusé avec succès.`;
          this.hideSuccessMessageAfterDelay();
          this.isLoading = false;
        },
        error: (notificationErr) => {
          console.error('Erreur lors de la création du rejet:', notificationErr);
          this.error = 'Le dossier a été refusé mais une erreur est survenue lors de l\'envoi des notifications.';
          this.loadDossiers();
          this.isLoading = false;
        }
      });
    },
    error: (err: HttpErrorResponse) => {
      console.error('Erreur lors de la validation du dossier (refus):', err);
      if (err.error) {
        if (typeof err.error === 'string') {
          this.error = err.error;
        } else if (err.error.message) {
          this.error = err.error.message;
        } else {
          this.error = 'Une erreur est survenue lors du refus du dossier. Code: ' + err.status;
        }
      } else if (err.message) {
        this.error = err.message;
      } else {
        this.error = 'Une erreur est survenue lors du refus du dossier. Veuillez vérifier la console pour plus de détails.';
      }
      this.isLoading = false;
    }
  });
}

cancelReject(): void {
  this.showRejectDialog = false;
  this.currentDossierForRejection = null;
  this.rejectReason = '';
  this.selectedUserTypesForNotification = [];
  this.selectedUsersForNotification = [];
  this.usersByType = {};
  this.rejectDialogStep = 1;
}
}
