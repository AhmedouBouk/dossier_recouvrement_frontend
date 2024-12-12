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

    if (this.authService.isAuthenticated() && userRole === requiredRole) {
      return true;
    }

    this.router.navigate(['/auth/login']);
    return false;
  }
}