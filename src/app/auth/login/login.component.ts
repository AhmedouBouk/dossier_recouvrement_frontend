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
        this.navigateBasedOnRole(userRole);
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
      this.router.navigate(['/admin/']);
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
