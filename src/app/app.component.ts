import { Component } from '@angular/core';
import { Router } from '@angular/router';
import{AuthService} from'src/app/auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'dossiers-recouvrement-frontend';

  constructor(private router: Router,    public authService: AuthService,
  ) {}

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/auth/login']);
  }
}
