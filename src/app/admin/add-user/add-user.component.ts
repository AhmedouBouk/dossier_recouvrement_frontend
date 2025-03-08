import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../admin.service';
import { AgenceService, Agence } from '../../shared/services/agence.service';
import { User } from '../../shared/models/user.model';
import { UserDataService } from '../../shared/services/user-data.service';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {
  user: any = {
    name: '',
    email: '',
    password: '',
    role: '',
    userType: '',
    agence: ''
  };
  
  roles: any[] = [];
  agences: Agence[] = [];
  isLoading = false;
  successMessage: string = '';  // Variable to hold the success message
  userDataService: any;
  showAgenceField: boolean = false;

  constructor(
    private adminService: AdminService,
    private agenceService: AgenceService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadRoles();
    this.loadAgences();
  }

  loadRoles(): void {
    this.adminService.getAllRoles().subscribe(
      (data) => {
        this.roles = data;
      },
      (error) => {
        console.error('Error loading roles:', error);
      }
    );
  }

  loadAgences(): void {
    this.agenceService.getAllAgences().subscribe(
      (response) => {
        console.log('Raw agences API response:', response);
        
        // Gérer différents formats de réponse
        if (Array.isArray(response)) {
          this.agences = response;
        } else if (response && typeof response === 'object') {
          const responseObj = response as Record<string, any>;
          
          // Vérifier si c'est une réponse paginée de Spring Data REST
          if (responseObj['_embedded'] && responseObj['_embedded']['agences']) {
            this.agences = responseObj['_embedded']['agences'] as Agence[];
          } else if (responseObj['_embedded'] && responseObj['_embedded']['agenceList']) {
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
      (error) => {
        console.error('Error loading agences:', error);
      }
    );
  }

  

  onUserTypeChange(): void {
    // Si le type d'utilisateur est Agence, afficher le champ Agence
    // Sinon, masquer le champ
    this.showAgenceField = this.user.userType === 'Agence';
    
    // Si le type n'est pas Agence, réinitialiser la valeur de l'agence
    if (!this.showAgenceField) {
      this.user.agence = '';
    }
  }

  onSubmit(): void {
    this.isLoading = true;
    
    // Trouver l'objet rôle complet basé sur le nom sélectionné
    const selectedRole = this.roles.find(role => role.name === this.user.role);
    
    // Créer l'objet utilisateur à envoyer
    const userData: any = {
      name: this.user.name,
      email: this.user.email,
      password: this.user.password,
      role: this.user.role, // Envoyer uniquement le nom du rôle, pas l'objet complet
      userType: this.user.userType // Ajouter le type d'utilisateur
    };

    // Ajouter agenceId seulement si le rôle est AGENCE et qu'une agence est sélectionnée
    if (this.showAgenceField && this.user.agence) {
      userData.agenceId = Number(this.user.agence);
    }

    console.log('Sending user data:', userData);

    this.adminService.addUser(userData).subscribe(
      () => {
        this.isLoading = false;
        this.successMessage = 'User added successfully!';
        setTimeout(() => {
          this.router.navigate(['/admin/user-list']);  // Navigate back to the user list after 2 seconds
        }, 2000);
      },
      (error) => {
        this.isLoading = false;
        console.error('Error adding user:', error);
        alert('Error adding user. Please try again.');
      }
    );
  }

  navigateBack(): void {
    this.router.navigate(['/admin/user-list']);
  }

  logout(): void {
    this.authService.logout();
  }
}
