import { Component } from '@angular/core';
import { AdminService } from '../admin.service';
import { Router } from '@angular/router';
import { User } from '../../shared/models/user.model';
import { UserDataService } from '../../shared/services/user-data.service';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent {
  user: Omit<User, 'id'> = {
    name: '',
    email: '',
    password: '',
    role: ''
  };

  successMessage: string = '';  // Variable to hold the success message
  userDataService: any;

  constructor(private adminService: AdminService, private router: Router,private authService: AuthService) {}

  onSubmit() {
    this.adminService.addUser(this.user).subscribe(
      response => {
        console.log('User added successfully:', response);
        this.successMessage = 'User added successfully!';
        setTimeout(() => {
          this.router.navigate(['/admin/user-list']);  // Navigate back to the user list after 2 seconds
        }, 2000);
      },
      error => {
        console.error('Error adding user:', error);
      }
    );
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
}
