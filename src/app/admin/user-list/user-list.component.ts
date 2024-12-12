import { Component, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';
import { Router } from '@angular/router';
import { User } from '../../shared/models/user.model';
import { UserDataService } from '../../shared/services/user-data.service';  // Import the UserDataService

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [];

  constructor(
    private adminService: AdminService,
    private router: Router,
    private userDataService: UserDataService
  ) {}

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.adminService.getAllUsers().subscribe(
      response => {
        this.users = response;
      },
      error => {
        console.error('Error fetching users:', error);
      }
    );
  }

  onAddUser() {
    this.router.navigate(['/admin/users/add']);
  }

  onEditUser(user: User) {
    this.userDataService.setUser(user);  // Store the selected user in the shared service
    this.router.navigate(['/admin/user-edit', user.id]);  // Navigating to edit with user ID
  }

  onDeleteUser(userId: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.adminService.deleteUser(userId).subscribe(
        () => {
          console.log('User deleted successfully');
          this.fetchUsers(); // Refresh user list after deletion
        },
        error => {
          console.error('Error deleting user:', error);
        }
      );
    }
  }
}
