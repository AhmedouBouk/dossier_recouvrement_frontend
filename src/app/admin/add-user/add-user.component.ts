import { Component } from '@angular/core';
import { AdminService } from '../admin.service';
import { Router } from '@angular/router';
import { User } from '../../shared/models/user.model';

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
    role: 'CONSULTANT'
  };

  successMessage: string = '';  // Variable to hold the success message

  constructor(private adminService: AdminService, private router: Router) {}

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
}
