import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { DossierRecouvrement } from '../models/dossier-recouvrement.model';
import { environment } from './../../../environments/environment';
import { jsPDF } from 'jspdf';
import { CautionsFileService } from './cautions-file.service';
import { CreditsFileService } from './credits-file.service';
import { GarantieService } from './garantie.service';

@Injectable({
  providedIn: 'root'
})
export class DossierRecouvrementService {
  private readonly apiUrl = `${environment.apiUrl}/dossiers`;  // Updated to match backend endpoint
  private readonly rejetUrl = `${environment.apiUrl}/rejets`;  // URL pour les rejets
  public detailsPdfBlobs: { [id: number]: Blob } = {};
 
  constructor(
    private readonly http: HttpClient,
    private readonly garantieService: GarantieService,
    private readonly creditService: CreditsFileService,
    private readonly cautionService: CautionsFileService
  ) { }

  // Get all dossiers
  getDossiers(): Observable<DossierRecouvrement[]> {
    return this.http.get<DossierRecouvrement[]>(`${this.apiUrl}/affichage`);
  }
  getDossiersSansGarantie(): Observable<DossierRecouvrement[]> {
    return this.http.get<DossierRecouvrement[]>(`${this.apiUrl}/sans-garantie`);
  }

  // Get dossier by ID
  getDossierById(id: number): Observable<DossierRecouvrement> {
    return this.http.get<DossierRecouvrement>(`${this.apiUrl}/${id}`);
  }

  // Create new dossier
  createDossier(dossier: DossierRecouvrement): Observable<DossierRecouvrement> {
    return this.http.post<DossierRecouvrement>(`${this.apiUrl}/create`, dossier);
  }

  // Update dossier
  updateDossier(id: number, dossier: DossierRecouvrement): Observable<DossierRecouvrement> {
    return this.http.put<DossierRecouvrement>(`${this.apiUrl}/update/${id}`, dossier);
  }
  
  /**
   * Crée un rejet pour un dossier avec notification aux utilisateurs spécifiés
   * @param dossierId ID du dossier à rejeter
   * @param motif Motif du rejet
   * @param typesUtilisateurs Types d'utilisateurs à notifier
   * @param utilisateursIds IDs des utilisateurs spécifiques à notifier
   * @returns Observable avec la réponse du serveur
   */
  createRejet(dossierId: number, motif: string, typesUtilisateurs: string[], utilisateursIds: number[]): Observable<any> {
    const payload = { motif, typesUtilisateurs, utilisateursIds };
    return this.http.post(`${environment.apiUrl}/rejets/dossiers/${dossierId}`, payload);
  }
  getChequeFileUrl(dossierId: number): Observable<string | null> {
    return this.http.get(`${this.apiUrl}/${dossierId}/cheque-file`, { responseType: 'text' }).pipe(
      catchError((error) => {
        console.error('Erreur lors de la récupération de l\'URL du fichier :', error);
        return of(null); // Retourne null en cas d'erreur
      })
    );
  }
  // Delete dossier
  deleteDossier(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete/${id}`, { responseType: 'text' as 'json' });
  }

  // Search dossiers
  searchDossiers(params: { dossierId?: number, numeroCompte?: string, nomClient?: string }): Observable<DossierRecouvrement[]> {
    let queryParams = new URLSearchParams();
    if (params.dossierId) queryParams.append('dossierId', params.dossierId.toString());
    if (params.numeroCompte) queryParams.append('numeroCompte', params.numeroCompte);
    if (params.nomClient) queryParams.append('nomClient', params.nomClient);

    return this.http.get<DossierRecouvrement[]>(`${this.apiUrl}/recherche?${queryParams}`);
  }

  // Import dossiers from CSV file
  importDossiers(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/import`, formData);
  }
  uploadGarantie(dossierId: number, formData: FormData): Observable<DossierRecouvrement> {
    return this.http.post<DossierRecouvrement>(`${this.apiUrl}/${dossierId}/garantie`, formData);
  }
 

  // Uploader un fichier de chèque
  uploadChequeFile(dossierId: number, file: File): Observable<DossierRecouvrement> {
    const formData = new FormData();
    formData.append('file', file);
  
    return this.http.post<DossierRecouvrement>(`${this.apiUrl}/${dossierId}/upload-cheque`, formData);
  }

  // Supprimer un fichier de chèque
  deleteChequeFile(dossierId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${dossierId}/cheque-files`);
  }

  generatePdf(dossierId: number) {
    return this.http.get(`${this.apiUrl}/${dossierId}/generate-pdf`, { responseType: 'blob' });
  }
  // Get comments for a dossier
getComments(dossierId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/${dossierId}/comments`);
}

// Add a comment to a dossier
addComment(dossierId: number, content: string, reminderDateTime?: string | null): Observable<any> {
  const payload: any = { content };
  if (reminderDateTime) payload.reminderDateTime = reminderDateTime;
  return this.http.post(`${environment.apiUrl}/dossiers/${dossierId}/comments`, payload);
}

// Update status and add a comment to a dossier
updateStatusWithComment(dossierId: number, status: string, content: string, reminderDateTime?: string | null): Observable<any> {
  const payload: any = { status, content };
  if (reminderDateTime) payload.reminderDateTime = reminderDateTime;
  return this.http.post(`${environment.apiUrl}/dossiers/${dossierId}/status-with-comment`, payload);
}

// Update an existing comment
updateComment(commentId: number, content: string, reminderDateTime?: string | null): Observable<any> {
  const payload: any = { content };
  if (reminderDateTime) payload.reminderDateTime = reminderDateTime;
  return this.http.put(`${environment.apiUrl}/dossiers/comments/${commentId}`, payload);
}

// Delete a comment
deleteComment(commentId: number): Observable<void> {
  return this.http.delete<void>(`${environment.apiUrl}/api/dossiers/comments/${commentId}`);
}

// Méthode obsolète - à utiliser uniquement pour la compatibilité avec le code existant
sendRejectionNotification(dossierId: number, reason: string, userTypes: string[]): Observable<any> {
  const payload = { reason, userTypes };
  return this.http.post(`${environment.apiUrl}/api/dossiers/${dossierId}/reject-notification`, payload);
}

// Méthode pour créer un rejet avec notification aux utilisateurs spécifiques
// Déjà implémentée plus haut

// Récupérer les rejets d'un dossier
getRejetsForDossier(dossierId: number): Observable<any[]> {
  return this.http.get<any[]>(`${environment.apiUrl}/api/rejets/dossiers/${dossierId}`);
}

// Marquer un rejet comme traité
marquerRejetCommeTraite(rejetId: number): Observable<any> {
  return this.http.post(`${environment.apiUrl}/api/rejets/${rejetId}/traiter`, {});
}

genererMiseEnDemeure(dossier: DossierRecouvrement) {
  if (!dossier) {
    console.error('❌ Aucun dossier fourni pour générer la mise en demeure.');
    return;
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  const logoUrl = 'assets/logo.png';

  const loadImage = new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.src = logoUrl;
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
  });

  loadImage.then(logoBase64 => {
    try {
      doc.addImage(logoBase64, 'PNG', margin, margin, 25, 25);
    } catch (e) {
      console.warn('⚠️ Logo non inséré:', e);
    }

    // Titre
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(30, 64, 175);
    doc.text('MISE EN DEMEURE DE PAIEMENT', pageWidth / 2, y + 15, { align: 'center' });

    y += 50;

    // Infos
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const currentDate = new Date().toLocaleDateString('fr-FR');

    doc.text(`Date: ${currentDate}`, margin, y); y += 10;
    doc.text(`Référence dossier: ${dossier.id}`, margin, y); y += 10;
    doc.text(`Client: ${dossier.compte?.nomCompte || 'N/A'}`, margin, y); y += 20;

    // Lettre
    doc.setFont('helvetica', 'bold');
    doc.text('Madame, Monsieur,', margin, y); y += 15;

    doc.setFont('helvetica', 'normal');
    const lines = [
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

    for (const line of lines) {
      if (line === '') {
        y += 8;
      } else {
        const split = doc.splitTextToSize(line, pageWidth - 2 * margin);
        doc.text(split, margin, y);
        y += split.length * 6;
      }
    }

    y += 20;
    doc.setFont('helvetica', 'bold');
    doc.text('Service Recouvrement', margin, y);

    // Pied de page
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Document généré le ${currentDate}`, pageWidth / 2, pageHeight - 15, { align: 'center' });

    doc.save(`Mise_en_Demeure_${dossier.id}.pdf`);
  }).catch(() => {
    console.warn('⚠️ Logo non chargé, génération sans image');
  });
}

private formatAmount(value: number | null | undefined): string {
  if (!value || isNaN(value)) return '0,00';
  return value.toFixed(2).replace('.', ',');
}


// Dans votre dossier-recouvrement.service.ts

/**
 * Télécharge un PDF fusionné avec tous les documents (y compris chèque et LC)
 */
downloadAllFichiersAsPdf(id: number): Observable<Blob> {
  return this.http.get(`/api/dossier-recouvrement/${id}/pdf`, {
    responseType: 'blob'
  });
}

/**
 * Fusionne tous les PDFs incluant les fichiers chèque et LC
 */
fusionnerToutAvecChequeEtLc(dossierId: number, detailsBlob: Blob, miseBlob: Blob): Observable<Blob> {
  const formData = new FormData();
  formData.append('detailsPdf', detailsBlob, 'details.pdf');
  formData.append('miseEnDemeurePdf', miseBlob, 'mise.pdf');

  return this.http.post(`${this.apiUrl}/${dossierId}/fusionner-complet`, formData, {
    responseType: 'blob'
  }).pipe(
    tap(() => console.log('✅ Fusion complète (avec chèque et LC) réussie')),
    catchError(error => {
      console.error('❌ Erreur lors de la fusion complète', error);
      throw error;
    })
  );
}

/**
 * Version mise à jour de fusionnerTout (renommage pour clarté)
 */
fusionnerTout(dossierId: number, detailsBlob: Blob, miseBlob: Blob): Observable<Blob> {
  return this.fusionnerToutAvecChequeEtLc(dossierId, detailsBlob, miseBlob);
}

/**
 * Vérifie quels fichiers sont disponibles pour un dossier
 */
getAvailableFiles(dossierId: number): Observable<any> {
  return this.http.get(`${this.apiUrl}/${dossierId}/files-status`).pipe(
    tap((status) => console.log('📋 Statut des fichiers:', status)),
    catchError(error => {
      console.error('❌ Erreur lors de la récupération du statut des fichiers', error);
      throw error;
    })
  );
}

/**
 * Archive un dossier
 */
archiverDossier(dossierId: number): Observable<any> {
  return this.http.post(`${this.apiUrl}/${dossierId}/archiver`, {}).pipe(
    tap((response) => console.log('✅ Dossier archivé:', response)),
    catchError(error => {
      console.error('❌ Erreur lors de l\'archivage', error);
      // ✅ Ajouter plus de détails sur l'erreur
      if (error.status === 400) {
        throw new Error('Le dossier est déjà archivé');
      } else if (error.status === 404) {
        throw new Error('Dossier non trouvé');
      } else if (error.status === 500) {
        throw new Error('Erreur serveur lors de l\'archivage');
      }
      throw error;
    })
  );
}

/**
 * Désarchive un dossier
 */
desarchiverDossier(dossierId: number): Observable<any> {
  // ✅ CORRECTION : URL correcte pour correspondre au controller
  return this.http.post(`${this.apiUrl}/${dossierId}/desarchiver`, {}).pipe(
    tap((response) => console.log('✅ Dossier désarchivé:', response)),
    catchError(error => {
      console.error('❌ Erreur lors du désarchivage', error);
      // ✅ Ajouter plus de détails sur l'erreur
      if (error.status === 400) {
        throw new Error('Le dossier n\'est pas archivé');
      } else if (error.status === 404) {
        throw new Error('Dossier non trouvé');
      } else if (error.status === 500) {
        throw new Error('Erreur serveur lors du désarchivage');
      }
      throw error;
    })
  );
}

/**
 * Compte le nombre de dossiers archivés (pour le badge dans la sidebar)
 */
countDossiersArchives(): Observable<number> {
  return this.http.get<{count: number}>(`${this.apiUrl}/archives/count`).pipe(
    map(response => response.count),
    catchError(error => {
      console.error('❌ Erreur lors du comptage des archives', error);
      return of(0);
    })
  );
}

/**
 * Vérifie si un dossier est archivé
 */
isDossierArchive(dossierId: number): Observable<boolean> {
  return this.http.get<{isArchived: boolean}>(`${this.apiUrl}/${dossierId}/is-archived`).pipe(
    map(response => response.isArchived),
    catchError(error => {
      console.error('❌ Erreur lors de la vérification d\'archivage', error);
      return of(false);
    })
  );
}

 // ✅ BehaviorSubject pour partager le nombre d'archives
  private archiveCountSubject = new BehaviorSubject<number>(0);
  
  /**
   * ✅ Observable pour écouter les changements du compteur d'archives
   */
  archiveCount$: Observable<number> = this.archiveCountSubject.asObservable();

  /**
   * ✅ Met à jour le compteur d'archives
   */
  updateArchiveCount(count: number): void {
    this.archiveCountSubject.next(count);
  }

  /**
   * ✅ Obtient la valeur actuelle du compteur
   */
  getCurrentArchiveCount(): number {
    return this.archiveCountSubject.value;
  }

  /**
   * ✅ Incrémente le compteur (quand un dossier est archivé)
   */
  incrementArchiveCount(): void {
    const currentCount = this.archiveCountSubject.value;
    this.archiveCountSubject.next(currentCount + 1);
  }

  /**
   * ✅ Décrémente le compteur (quand un dossier est désarchivé)
   */
  decrementArchiveCount(): void {
    const currentCount = this.archiveCountSubject.value;
    if (currentCount > 0) {
      this.archiveCountSubject.next(currentCount - 1);
    }
  }



getDossiersActifs(): Observable<DossierRecouvrement[]> {
  return this.http.get<DossierRecouvrement[]>(`${this.apiUrl}/actifs`);
}

getDossiersArchives(): Observable<DossierRecouvrement[]> {
  return this.http.get<DossierRecouvrement[]>(`${this.apiUrl}/archives`);
}

/**
 * Réinitialise l'état de validation d'un dossier après traitement d'un rejet
 * @param dossierId L'ID du dossier à réinitialiser
 */
resetValidationState(dossierId: number): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/${dossierId}/reset-validation`, {});
}
  
}