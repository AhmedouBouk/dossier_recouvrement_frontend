import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../admin.service';
import { User } from '../../shared/models/user.model';
import { UserDataService } from '../../shared/services/user-data.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from 'src/app/auth/auth.service';
import { AgenceService, Agence } from '../../shared/services/agence.service';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css']
})
export class UserEditComponent implements OnInit {
  user: User = {
    id: 0,
    name: '',
    email: '',
    password: '',
    role: '',
    userType: '',
    agenceId: undefined
  };

  roles: any[] = [];
  agences: Agence[] = [];
  currentUserName: string = '';
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  showAgenceField: boolean = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly adminService: AdminService,
    private readonly userDataService: UserDataService,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly agenceService: AgenceService
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.loadRoles();
    this.loadAgences();
  }

  private loadUserData() {
    this.isLoading = true;
    const user = this.userDataService.getUser();

    if (user) {
      this.user = {
        ...user,
        // S'assurer que user.role est le nom du rôle (string) si c'est un objet
        role: (user.role && typeof user.role === 'object') ? user.role.name : user.role,
        password: ''
      };
      this.updateAgenceFieldVisibility();
      this.isLoading = false;
    } else {
      const userId = this.route.snapshot.paramMap.get('id');
      if (userId) {
        this.adminService.getUserById(+userId).subscribe({
          next: (response) => {
            this.user = { 
              ...response,
              // Extraire le nom du rôle de l'objet rôle
              role: response.role ? response.role.name : null,
              password: '',
              agenceId: response.agence?.id
            };
            this.updateAgenceFieldVisibility();
          },
          error: (error: HttpErrorResponse) => {
            console.error('Error fetching user details:', error);
            this.handleError(error);
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      } else {
        this.errorMessage = 'No user ID provided.';
        this.isLoading = false;
        this.navigateBack();
      }
    }
  }

  private loadRoles() {
    this.adminService.getAllRoles().subscribe(roles => {
      this.roles = roles;
      console.log('Roles chargés:', this.roles);
    });
  }

  private loadAgences(): void {
    this.agenceService.getAllAgences().subscribe({
      next: (response) => {
        console.log('Raw agences API response:', response);
        
        // Gérer différents formats de réponse
        if (Array.isArray(response)) {
          this.agences = response;
        } else if (response && typeof response === 'object') {
          const responseObj = response as Record<string, any>;
          
          // Vérifier si c'est une réponse paginée de Spring Data REST
          if (responseObj['_embedded']?.['agences']) {
            this.agences = responseObj['_embedded']['agences'] as Agence[];
          } else if (responseObj['_embedded']?.['agenceList']) {
            this.agences = responseObj['_embedded']['agenceList'] as Agence[];
          } else if (responseObj['_embedded']) {
            // Si _embedded existe mais pas avec le nom attendu, chercher la première propriété tableau
            const embedded = responseObj['_embedded'] as Record<string, any>;
            const firstArrayProperty = Object.keys(embedded).find(key => Array.isArray(embedded[key]));
            
            if (firstArrayProperty) {
              this.agences = embedded[firstArrayProperty] as Agence[];
            } else {
              console.warn('No array found in _embedded, converting response to array:', response);
              this.agences = [response as Agence];
            }
          } else if (responseObj['data'] && Array.isArray(responseObj['data'])) {
            this.agences = responseObj['data'] as Agence[];
          } else {
            console.warn('Response is not in expected format, converting to array:', response);
            this.agences = [response as Agence];
          }
        } else {
          console.error('Unexpected response format:', response);
          this.agences = [];
        }
        
        console.log('Processed agences:', this.agences);
      },
      error: (error) => {
        console.error('Error loading agences:', error);
      }
    });
  }

  onUserTypeChange(): void {
    this.updateAgenceFieldVisibility();
  }

  private updateAgenceFieldVisibility(): void {
    // Afficher le champ Agence uniquement si le type d'utilisateur est Agence
    this.showAgenceField = this.user.userType === 'Agence';
    
    // Si le champ agence est masqué, réinitialiser la valeur de l'agence
    if (!this.showAgenceField) {
      this.user.agenceId = undefined;
    }
  }

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Créer un objet de requête qui correspond à ce que le backend attend
    const updateRequest: any = {
      id: this.user.id,
      name: this.user.name.trim(),
      email: this.user.email.trim(),
      // S'assurer que seul le nom du rôle est envoyé
      role: typeof this.user.role === 'object' ? this.user.role.name : this.user.role,
      userType: this.user.userType,
      // Inclure le mot de passe uniquement s'il a été modifié
      password: this.user.password,
      // Inclure l'ID de l'agence uniquement si nécessaire
      agenceId: this.showAgenceField ? this.user.agenceId : undefined
    };
    
    console.log('Envoi de la requête de mise à jour :', updateRequest);

    this.adminService.updateUser(updateRequest).subscribe({
      next: (response: User) => {
        console.log('User updated successfully:', response);
        this.successMessage = 'User updated successfully!';
        this.userDataService.clearUser();
        setTimeout(() => this.navigateToUserList(), 1000);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error updating user:', error);
        this.handleError(error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 403) {
      this.errorMessage = 'You do not have permission to perform this action. Please check your user role.';
    } else if (error.status === 404) {
      this.errorMessage = 'User not found.';
    } else {
      this.errorMessage = 'An error occurred. Please try again later.';
    }
  }

  private isFormValid(): boolean {
    return (
      this.user.name.trim().length >= 2 &&
      this.isValidEmail(this.user.email) &&
      (this.user.password === '' ) &&
      !!this.user.role &&
      !!this.user.userType &&
      (!this.showAgenceField || !!this.user.agenceId)
    );
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email.trim());
  }

  isFieldValid(fieldName: string): boolean {
    // Handle the case where the field might be undefined
    const field = this.user[fieldName as keyof typeof this.user];
    
    if (field === undefined) return false;
  
    switch (fieldName) {
      case 'name':
        return typeof field === 'string' && field.trim().length >= 2;
      case 'email':
        return typeof field === 'string' && this.isValidEmail(field);
      case 'password':
        return typeof field === 'string' && (field === '' || field.length >= 6);
      case 'role':
        return typeof field === 'string' && field !== '';
      case 'userType':
        return typeof field === 'string' && field !== '';
      case 'agence':
        return !this.showAgenceField || (this.user.agenceId !== null && this.user.agenceId !== undefined);
      default:
        return true;
    }
  }

  getFieldErrorMessage(fieldName: string): string {
    if (!this.isFieldValid(fieldName)) {
      switch (fieldName) {
        case 'name':
          return 'Name must be at least 2 characters long';
        case 'email':
          return 'Please enter a valid email address';
        case 'password':
          return 'Password must be at least 6 characters long';
        case 'role':
          return 'Please select a role';
        case 'userType':
          return 'Please select a user type';
        case 'agence':
          return 'Please select an agency';
        default:
          return 'Invalid input';
      }
    }
    return '';
  }

  navigateToUserList() {
    this.router.navigate(['/admin/user-list']);
  }

  navigateBack() {
    this.router.navigate(['/admin/user-list']);
  }

  logout(): void {
    this.authService.logout();
  }

  // Helper method for role display
  getRoleClass(role: string): string {
    return role.toLowerCase();
  }
}