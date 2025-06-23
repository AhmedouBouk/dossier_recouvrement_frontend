import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NonAdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const userRole = this.authService.getUserRole();
    
    // Normalize user role to have ROLE_ prefix
    const normalizedUserRole = userRole.startsWith('ROLE_') ? 
      userRole : `ROLE_${userRole}`;
    
    // If user is an admin, redirect to admin page
    if (normalizedUserRole === 'ROLE_ADMIN') {
      console.log('Admin access denied to non-admin route. Redirecting to admin area.');
      
      // Check if user is authenticated
      if (this.authService.isAuthenticated()) {
        this.router.navigate(['/admin/user-list']);
      } else {
        this.router.navigate(['/auth/login']);
      }
      return false;
    }
    
    // Allow access for non-admin users
    return true;
  }
}
