import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const userRole = this.authService.getRole();
    const requiredRole = route.data['role'];

    // If path contains 'admin' and user is not an admin, deny access
    if (state.url.includes('admin') && userRole !== 'ADMIN') {
      this.router.navigate(['/auth/login']);
      return false;
    }

    // For non-admin pages, check if user has the required role OR is an admin
    if (!state.url.includes('admin')) {
      return userRole === requiredRole || userRole === 'ADMIN';
    }

    // For admin pages, strictly check for admin role
    return userRole === requiredRole;
  }
}