import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../admin.service';
import { User } from '../../shared/models/user.model';
import { UserDataService } from '../../shared/services/user-data.service';  // Import UserDataService
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

  constructor(
    private route: ActivatedRoute,
    private adminService: AdminService,
    private userDataService: UserDataService,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.userDataService.getUser();  // Get user data from the service

    if (user) {
      // If user data is available, use it directly
      this.user = user;
    } else {
      // If no user data is found in the service, fetch it using the ID from the route
      const userId = this.route.snapshot.paramMap.get('id');
      if (userId) {
        
        this.adminService.getUserById(+userId).subscribe(
          response => {
            this.user = response;
          },
          (error: HttpErrorResponse) => {
            console.error('Error fetching user details:', error);
            if (error.status === 403) {
              alert('You do not have permission to view this user\'s details. Please check your user role.');
            }
          }
        );
      } else {
        console.error('No user ID provided.');
      }
    }
  }

  onSubmit() {
    if (this.user.id !== undefined) {
      // Update the user with the new details from the form
      this.adminService.updateUser(this.user).subscribe(
        (response: User) => {
          console.log('User updated successfully:', response);
          this.userDataService.clearUser();  // Clear the user data from the service
          this.router.navigate(['/admin/user-list']);  // Navigate back to the user list after update
        },
        (error: HttpErrorResponse) => {
          console.error('Error updating user:', error);
          if (error.status === 403) {
            alert('You do not have permission to update this user. Please check your user role.');
          }
        }
      );
    }
  }
}
