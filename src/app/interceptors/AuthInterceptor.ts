import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service'; // Assurez-vous que ce chemin est correct

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Exclure les requêtes d'authentification de l'interception pour éviter les boucles
    // si la page de login elle-même déclenche des appels API qui pourraient échouer avec 401 initialement
    if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
      return next.handle(req);
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Vérifier à nouveau pour éviter les boucles si la page de login elle-même cause un 401
          if (!this.router.url.includes('/auth/login')) {
            console.error('AuthInterceptor: HTTP 401 Unauthorized error. Logging out.', error);
            this.authService.logout();
            // Optionnel: Afficher un message à l'utilisateur via un service de notification
            // par exemple: this.notificationService.showError('Session expirée. Veuillez vous reconnecter.');
          }
        }
        return throwError(() => error); // Renvoyer l'erreur pour que d'autres la traitent si besoin
      })
    );
  }
}