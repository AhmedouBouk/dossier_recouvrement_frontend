import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const requiredRole = route.data['role'] as string;
    const userRole = this.authService.getUserRole();
    
    // Normalize roles to have ROLE_ prefix
    const normalizedRequiredRole = requiredRole.startsWith('ROLE_') ? 
      requiredRole : `ROLE_${requiredRole}`;
    const normalizedUserRole = userRole.startsWith('ROLE_') ? 
      userRole : `ROLE_${userRole}`;

    if (normalizedUserRole === normalizedRequiredRole) {
      return true;
    }

    console.log('Access denied - Required role:', normalizedRequiredRole, 'User role:', normalizedUserRole);
    this.router.navigate(['/dashboard']);
    return false;
  }
}