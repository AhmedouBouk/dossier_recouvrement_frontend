import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  passwordVisible: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    if (this.authService.isAuthenticated()) {
      this.navigateBasedOnRole(this.authService.getRole());
    }

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  ngOnInit(): void {
    // Add animation class after a brief delay
    setTimeout(() => {
      document.querySelector('.login-container')?.classList.add('visible');
    }, 100);
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs correctement';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: () => {
        const role = this.authService.getRole();
        if (role) {
          this.navigateBasedOnRole(role);
        } else {
          this.errorMessage = 'Token invalide';
          this.authService.logout();
        }
      },
      error: (error) => {
        if (error.status === 401) {
          this.errorMessage = 'Email ou mot de passe incorrect';
        } else if (error.status === 403) {
          this.errorMessage = 'Accès non autorisé';
        } else if (error.message.includes('Trop de tentatives')) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
        }
        this.isLoading = false;
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
      case 'ADMIN':
        this.router.navigate(['/admin/user-list']);
        break;
      case 'DO':
      case 'DC':
      case 'RECOUVREMENT':
      case 'DGCR':
        this.router.navigate(['/dashboard']);
        break;
      default:
        this.errorMessage = 'Rôle non reconnu';
        this.authService.logout();
        break;
    }
  }

  onInputChange(): void {
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    if (control?.errors) {
      if (control.errors['required']) {
        return `Le champ ${controlName} est requis`;
      }
      if (control.errors['email']) {
        return 'Format d\'email invalide';
      }
      if (control.errors['minlength']) {
        return 'Le mot de passe doit contenir au moins 6 caractères';
      }
    }
    return '';
  }
}