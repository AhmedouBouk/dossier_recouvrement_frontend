import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../admin.service';
import { User } from '../../shared/models/user.model';
import { UserDataService } from '../../shared/services/user-data.service';
import { HttpErrorResponse } from '@angular/common/http';

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
    role: ''
  };

  currentUserName: string = '';
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private adminService: AdminService,
    private userDataService: UserDataService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

  private loadUserData() {
    this.isLoading = true;
    const user = this.userDataService.getUser();

    if (user) {
      this.user = { ...user, password: '' };
      this.isLoading = false;
    } else {
      const userId = this.route.snapshot.paramMap.get('id');
      if (userId) {
<<<<<<< HEAD
        this.adminService.getUserById(+userId).subscribe({
          next: (response) => {
            this.user = { ...response, password: '' };
=======
        
        this.adminService.getUserById(+userId).subscribe(
          response => {
            this.user = response;
>>>>>>> 047ab46a86ade59ab55c93384a4edc5a2a025baf
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

  onSubmit() {
    

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const updateRequest = {
      id: this.user.id,
      name: this.user.name.trim(),
      email: this.user.email.trim(),
      role: this.user.role,
      password: this.user.password // Only included if changed
    };

    this.adminService.updateUser(updateRequest).subscribe({
      next: (response: User) => {
        console.log('User updated successfully:', response);
        this.successMessage = 'User updated successfully!';
        this.userDataService.clearUser();
        setTimeout(() => this.navigateToUserList(), 2000);
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
      !!this.user.role
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

  logout() {
    this.userDataService.clearUser();
    this.router.navigate(['/login']);
  }

  // Helper method for role display
  getRoleClass(role: string): string {
    return role.toLowerCase();
  }
}