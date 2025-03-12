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
        console.log('Loaded roles:', this.roles);
      },
      (error) => {
        console.error('Error loading roles:', error);
      }
    );
  }

  loadAgences(): void {
    this.agenceService.getAllAgences().subscribe(
      (agences) => {
        this.agences = agences;
        console.log('Agences chargées avec succès:', this.agences);
      },
      (error) => {
        console.error('Erreur lors du chargement des agences:', error);
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
    
    // Créer l'objet utilisateur à envoyer
    const userData: any = {
      name: this.user.name,
      email: this.user.email,
      password: this.user.password,
      userType: this.user.userType
    };

    // S'assurer que le rôle est au bon format (sans le préfixe ROLE_ si déjà présent)
    if (this.user.role) {
      // Si le rôle commence déjà par "ROLE_", l'utiliser tel quel, sinon l'utiliser directement
      userData.role = this.user.role;
      console.log('Role being sent:', userData.role);
    }

    // Ajouter agenceId seulement si le type d'utilisateur est Agence ou si le rôle contient "AGENCE"
    if ((this.showAgenceField || (this.user.role && this.user.role.toUpperCase().includes('AGENCE'))) && this.user.agence) {
      // Convertir explicitement en nombre et vérifier que c'est un nombre valide
      const agenceId = parseInt(this.user.agence, 10);
      if (!isNaN(agenceId)) {
        userData.agenceId = agenceId;
        console.log('Setting agenceId:', userData.agenceId);
        
        // Vérifier que l'agence existe
        const selectedAgence = this.agences.find(a => a.id === agenceId);
        if (selectedAgence) {
          console.log('Selected agency:', selectedAgence.nom, '(ID:', selectedAgence.id, ')');
        } else {
          console.warn('Selected agency ID not found in loaded agencies:', agenceId);
        }
      } else {
        console.error('Invalid agency ID:', this.user.agence);
      }
    }

    console.log('Sending user data:', userData);

    this.adminService.addUser(userData).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('User created successfully:', response);
        this.successMessage = 'User added successfully!';
        setTimeout(() => {
          this.router.navigate(['/admin/user-list']);  // Navigate back to the user list after 2 seconds
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error adding user:', error);
        
        // Afficher des détails supplémentaires sur l'erreur
        if (error.error) {
          console.error('Error details:', error.error);
          
          // Si l'erreur contient un message spécifique du backend
          if (typeof error.error === 'string') {
            console.error('Backend error message:', error.error);
          } else if (error.error.message) {
            console.error('Backend error message:', error.error.message);
          }
        }
        
        // Vérifier si le statut est 400 (Bad Request)
        if (error.status === 400) {
          console.error('Bad Request Error. Check if the role format is correct and all required fields are provided.');
          
          // Afficher les données qui ont été envoyées pour le débogage
          console.log('Data that was sent:', {
            name: this.user.name,
            email: this.user.email,
            password: this.user.password ? '***' : undefined, // Masquer le mot de passe réel
            role: this.user.role,
            userType: this.user.userType,
            agenceId: this.user.agence ? parseInt(this.user.agence, 10) : undefined
          });
        }
        
        // Message d'erreur plus détaillé
        let errorMessage = 'Error adding user. ';
        if (error.error && typeof error.error === 'string') {
          errorMessage += error.error;
        } else if (error.error?.message) {
          errorMessage += error.error.message;
        } else if (error.message) {
          errorMessage += error.message;
        } else {
          errorMessage += 'Please check console for details and try again.';
        }
        
        alert(errorMessage);
      }
    });
  }

  navigateBack(): void {
    this.router.navigate(['/admin/user-list']);
  }

  logout(): void {
    this.authService.logout();
  }
}
