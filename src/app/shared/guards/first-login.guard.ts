import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class FirstLoginGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // If user is on first login and trying to access a page other than change-password
    if (this.authService.isFirstLogin() && !state.url.includes('/change-password')) {
      // Redirect to change password page
      this.router.navigate(['/change-password']);
      return false;
    }
    
    // If user is not on first login and trying to access change-password page
    if (!this.authService.isFirstLogin() && state.url.includes('/change-password')) {
      // Redirect to dashboard
      this.router.navigate(['/dashboard']);
      return false;
    }
    
    return true;
  }
}
