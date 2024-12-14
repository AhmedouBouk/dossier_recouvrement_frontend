import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.navigateBasedOnRole(this.authService.getRole());
    }
  }

  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Login successful');
        const role = this.authService.getRole();
        if (role) {
          this.navigateBasedOnRole(role);
        } else {
          this.errorMessage = 'Token invalide';
          this.authService.logout();
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        if (error.status === 401) {
          this.errorMessage = 'Email ou mot de passe incorrect';
        } else if (error.status === 403) {
          this.errorMessage = 'Accès non autorisé';
        } else {
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
        }
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private navigateBasedOnRole(role: string | null) {
    if (!role) {
      this.errorMessage = 'Rôle non défini';
      return;
    }

    switch(role) {
      case 'DO':
        this.router.navigate(['/clients']);
        break;
      case 'DC':
        this.router.navigate(['/comptes']);
        break;
      case 'ADMIN':
        this.router.navigate(['/admin/user-list']);
        break;
      case 'RECOUVREMENT':
        this.router.navigate(['/dossiers']);
        break;
      case 'DGCR':
        this.router.navigate(['/credits']);
        break;
      default:
        this.errorMessage = 'Rôle non reconnu';
        this.authService.logout();
        break;
    }
  }
}