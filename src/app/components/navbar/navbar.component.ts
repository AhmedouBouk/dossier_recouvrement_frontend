import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  userName: string = 'Utilisateur non connecté';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.userName = this.authService.getLoggedInUserName();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']); // Redirection après déconnexion
  }
}
