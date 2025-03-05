import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-navigation-header',
  templateUrl: './navigation-header.component.html',
  styleUrls: ['./navigation-header.component.css']
})
export class NavigationHeaderComponent implements OnInit {
  @Input() activeSection: 'users' | 'roles' | 'agences' = 'users';
  @Input() pageTitle: string = 'Gestion';
  
  userName: string = '';
  userRole: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userName = this.authService.getLoggedInUserName();
    this.userRole = this.authService.getRole() || 'No Role';
  }

  navigateToUsers(): void {
    this.router.navigate(['/admin/user-list']);
  }

  navigateToRoles(): void {
    this.router.navigate(['/admin/roles']);
  }

  navigateToAgences(): void {
    this.router.navigate(['/admin/agences']);
  }

  logout(): void {
    this.authService.logout();
  }
}