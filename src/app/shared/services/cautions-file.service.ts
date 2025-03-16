// src/app/shared/services/cautions-file.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CautionsFileService {
  private apiUrl = `${environment.apiUrl}/cautions`;

  constructor(private http: HttpClient) {}

  // Uploader un fichier de caution
  uploadCautionsFile(dossierId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post(`${this.apiUrl}/${dossierId}/upload`, formData)
      .pipe(catchError(this.handleError));
  }

  // Supprimer un fichier de caution
  deleteCautionsFile(dossierId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${dossierId}/delete`)
      .pipe(catchError(this.handleError));
  }

  // Récupérer l'URL du fichier de caution
  getCautionsFileUrl(dossierId: number): Observable<string> {
    return this.http
      .get<string>(`${this.apiUrl}/${dossierId}/url`)
      .pipe(catchError(this.handleError));
  }

  // Gestion des erreurs
  private handleError(error: HttpErrorResponse) {
    console.error('Une erreur s’est produite:', error);
    return throwError(
      'Une erreur s’est produite lors de la gestion des fichiers de caution.'
    );
  }
}