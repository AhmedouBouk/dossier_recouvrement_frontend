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
  errorMessage: string = ''; // Variable to hold the error message
  userDataService: any;
  showAgenceField: boolean = false;
  readonly passwordPattern = /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])[a-zA-Z0-9!@#$%^&*(),.?":{}|<>]{8,}$/;

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
    this.successMessage = ''; // Reset success message
    this.errorMessage = '';   // Reset error message
    
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

    // Vérification front-end avant l'envoi
    if (!this.user.name || !this.user.email || !this.user.password) {
        this.errorMessage = "Veuillez remplir tous les champs obligatoires.";
        this.isLoading = false;
        return;
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(this.user.email)) {
        this.errorMessage = "Veuillez saisir une adresse email valide.";
        this.isLoading = false;
        return;
    }
    if (!this.passwordPattern.test(this.user.password)) {
        this.errorMessage = "Le mot de passe doit contenir au moins 8 caractères, un chiffre et un caractère spécial.";
        this.isLoading = false;
        return;
    }

    this.adminService.addUser(userData).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('User created successfully:', response);
        this.successMessage = 'Utilisateur ajouté avec succès!'; // Updated message in French
        this.errorMessage = ''; // Clear any previous error message
        setTimeout(() => {
          this.router.navigate(['/admin/user-list']);  // Navigate back to the user list after 2 seconds
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.successMessage = ''; // Clear any previous success message

        if (error.error && error.error.error) {
          this.errorMessage = error.error.error; // Message d'erreur du backend
          console.error('Backend error message:', this.errorMessage);
        } else if (error.status === 0) { // Erreur de connexion / CORS / Serveur injoignable
          this.errorMessage = "Impossible de contacter le serveur. Vérifiez votre connexion internet ou contactez l'administrateur.";
          console.error('Network or CORS error:', error);
        } else if (error.message) { // Autre erreur HTTP, e.g., HTML response instead of JSON
          this.errorMessage = `Une erreur inattendue est survenue (status: ${error.status}). Veuillez réessayer ou contacter le support.`;
          console.error('Unexpected error:', error.message);
        } else {
          this.errorMessage = 'Une erreur est survenue lors de l\'ajout de l\'utilisateur. Veuillez vérifier la console pour plus de détails.';
        }
        
        // Afficher des détails supplémentaires sur l'erreur dans la console
        if (error.error) {
          console.error('Error details:', error.error);
        }
        
        // Vérifier si le statut est 400 (Bad Request) pour le débogage
        if (error.status === 400) {
          console.error('Bad Request Error. Check if the role format is correct and all required fields are provided.');
          console.log('Data that was sent:', {
            name: this.user.name,
            email: this.user.email,
            password: this.user.password ? '***' : undefined, // Masquer le mot de passe réel
            role: this.user.role,
            userType: this.user.userType,
            agenceId: this.user.agence ? parseInt(this.user.agence, 10) : undefined
          });
        }
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
