import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
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
  currentYear: number = new Date().getFullYear();

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly snackBar: MatSnackBar
  ) {
    if (this.authService.isAuthenticated()) {
      this.navigateBasedOnRole(this.authService.getRole());
    }

    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      document.querySelector('.login-container')?.classList.add('visible');
    }, 100);
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  onSubmit() {
    if (this.loginForm.invalid) return;
  
    this.isLoading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        const userRole = this.authService.getUserRole();
        console.log("User logged in with role:", userRole); // Debugging log
        
        // Check if user needs to change password on first login
        if (this.authService.isFirstLogin()) {
          console.log("First login detected, redirecting to change password");
          this.router.navigate(['/change-password']);
        } else {
          this.navigateBasedOnRole(userRole);
        }
      },
      error: err => {
        this.errorMessage = 'Invalid credentials';
        this.isLoading = false;
      }
    });
  }
  

  private navigateBasedOnRole(role: string | null) {
    console.log("User role:", role); // Debugging log
    if (!role) {
      this.errorMessage = 'Rôle non défini';
      return;
    }

    if (role === 'ROLE_ADMIN') {
      console.log("Navigating to /admin/");
      this.router.navigate(['/admin/user-list']);
    } else {
      console.log("Navigating to /dashboard");
      this.router.navigate(['/dashboard']);
    }
  }

  onInputChange(): void {
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    if (!control) return '';
    
    if (control.hasError('required')) {
      return 'Ce champ est requis';
    }
    
    if (control.hasError('minlength')) {
      return `Minimum ${control.getError('minlength').requiredLength} caractères`;
    }
    
    return 'Champ invalide';
  }

  onForgotPassword(): void {
    this.snackBar.open('Fonctionnalité de réinitialisation du mot de passe à venir', 'Fermer', {
      duration: 5000,
      panelClass: ['snackbar-info']
    });
  }

  onContactSupport(): void {
    this.snackBar.open('Veuillez contacter le support à support@bnm.mr', 'Copier', {
      duration: 10000,
      panelClass: ['snackbar-info']
    }).onAction().subscribe(() => {
      navigator.clipboard.writeText('support@bnm.mr');
      this.snackBar.open('Adresse email copiée dans le presse-papier', 'OK', {
        duration: 3000
      });
    });
  }

  onPrivacyPolicy(): void {
    this.snackBar.open('Politique de confidentialité - En cours de préparation', 'Fermer', {
      duration: 5000,
      panelClass: ['snackbar-info']
    });
  }
}
