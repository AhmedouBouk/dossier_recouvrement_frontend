import { Component, OnInit, OnDestroy } from '@angular/core';
import { AdminService } from '../admin.service';
import { Router } from '@angular/router';
import { User } from '../../shared/models/user.model';
import { UserDataService } from '../../shared/services/user-data.service';
import { AuthService } from 'src/app/auth/auth.service';
import { finalize } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, OnDestroy {
  users: User[] = [];
  userName: string = '';
  isLoading: boolean = false;
  isNotificationVisible: boolean = false;
  notificationMessage: string = '';
  notificationType: 'success-snackbar' | 'error-snackbar' = 'success-snackbar';
  private destroy$ = new Subject<void>();

  constructor(
    private adminService: AdminService,
    private router: Router,
    private userDataService: UserDataService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeComponent(): void {
    this.userName = this.authService.getLoggedInUserName();
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.isLoading = true;
    this.adminService.getAllUsers()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response) => {
          this.users = response;
        },
        error: (error) => {
          console.error('Error fetching users:', error);
          this.showNotification('Error loading users', 'error-snackbar');
        }
      });
  }

  onAddUser(): void {
    this.router.navigate(['/admin/users/add']);
  }

  onEditUser(user: User): void {
    this.userDataService.setUser(user);
    this.router.navigate(['/admin/user-edit', user.id]);
  }

  onDeleteUser(userId: number): void {
    if (confirm(`Are you sure you want to delete this user?`)) {
      this.adminService.deleteUser(userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showNotification('User deleted successfully', 'success-snackbar');
            this.fetchUsers();
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            this.showNotification('Error deleting user', 'error-snackbar');
          }
        });
    }
  }

  logout(): void {
    this.authService.logout();
  }

  private showNotification(message: string, type: 'success-snackbar' | 'error-snackbar'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    this.isNotificationVisible = true;

    setTimeout(() => {
      this.isNotificationVisible = false;
    }, 3000);
  }

  // Helper methods for template
  getRoleIcon(role: string): string {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'admin_panel_settings';
      case 'editor':
        return 'edit_note';
      default:
        return 'person_outline';
    }
  }

  getRoleClass(role: string): string {
    return role.toLowerCase();
  }

  trackByUserId(index: number, user: User): number {
    return user.id;
  }
}