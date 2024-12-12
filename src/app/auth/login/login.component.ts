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
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.loading = false;
        this.navigateBasedOnRole(response.role);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Identifiants invalides';
      }
    });
  }

  private navigateBasedOnRole(role: string) {
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
        this.router.navigate(['/auth/login']);
        break;
    }
  }
}