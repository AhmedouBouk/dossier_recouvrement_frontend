import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { DossierRecouvrement } from '../models/dossier-recouvrement.model';
import { environment } from './../../../environments/environment';
import {jsPDF } from 'jspdf';
import { map } from 'rxjs/operators';
import { tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { CautionsFileService } from './cautions-file.service';
import { CreditsFileService } from './credits-file.service';
import { GarantieService } from './garantie.service';
// Mise à jour du composant ListDossier pour fusionner tous les PDFs
import { Component, OnInit, ViewChild } from '@angular/core';

import { firstValueFrom } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class DossierRecouvrementService {
  private apiUrl = `${environment.apiUrl}/dossiers`;  // Updated to match backend endpoint
 public detailsPdfBlobs: { [id: number]: Blob } = {};
 
  constructor
  (private http: HttpClient,
   private garantieService: GarantieService,
   private creditService:CreditsFileService,
   private cautionService:CautionsFileService

  ) {}

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
  getChequeFileUrl(dossierId: number): Observable<string | null> {
    return this.http.get(`${this.apiUrl}/${dossierId}/cheque-file`, { responseType: 'text' }).pipe(
      catchError((error) => {
        console.error('Erreur lors de la récupération de l\'URL du fichier :', error);
        return of(null); // Retourne null en cas d'erreur
      })
    );
  }
  // Delete dossier
  deleteDossier(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/delete/${id}`);
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
  return this.http.get<any[]>(`${environment.apiUrl}/api/dossiers/${dossierId}/comments`);
}

// Add a comment to a dossier
addComment(dossierId: number, content: string, reminderDateTime?: string | null): Observable<any> {
  const payload: any = { content };
  if (reminderDateTime) payload.reminderDateTime = reminderDateTime;
  return this.http.post(`${environment.apiUrl}/api/dossiers/${dossierId}/comments`, payload);
}

// Update status and add a comment to a dossier
updateStatusWithComment(dossierId: number, status: string, content: string, reminderDateTime?: string | null): Observable<any> {
  const payload: any = { status, content };
  if (reminderDateTime) payload.reminderDateTime = reminderDateTime;
  return this.http.post(`${environment.apiUrl}/api/dossiers/${dossierId}/status-with-comment`, payload);
}

// Update an existing comment
updateComment(commentId: number, content: string, reminderDateTime?: string | null): Observable<any> {
  const payload: any = { content };
  if (reminderDateTime) payload.reminderDateTime = reminderDateTime;
  return this.http.put(`${environment.apiUrl}/api/dossiers/comments/${commentId}`, payload);
}

// Delete a comment
deleteComment(commentId: number): Observable<void> {
  return this.http.delete<void>(`${environment.apiUrl}/api/dossiers/comments/${commentId}`);
}

genererMiseEnDemeure(dossier: DossierRecouvrement) {
  const doc = new jsPDF();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Mise en Demeure de Paiement', 20, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);
  doc.text(`ID Dossier: ${dossier.id}`, 20, 40);
  doc.text(`Nom du Client: ${dossier.compte.nomCompte}`, 20, 50);
  doc.text(`Montant Dû: ${dossier.montantPrincipal} €`, 20, 60);

  doc.text('Madame, Monsieur,', 20, 80);
  doc.text(
    `Nous vous informons que la somme de ${dossier.montantPrincipal} € reste impayée malgré nos relances.`,
    20,
    90,
    { maxWidth: 170 }
  );
  doc.text(
    'Nous vous mettons en demeure de régler cette somme sous 15 jours, sans quoi nous engagerons des actions légales.',
    20,
    100,
    { maxWidth: 170 }
  );

  doc.text('Cordialement,', 20, 120);
  doc.text('Votre Société de Recouvrement', 20, 130);

  doc.save(`Mise_en_Demeure_${dossier.id}.pdf`);
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

  
}