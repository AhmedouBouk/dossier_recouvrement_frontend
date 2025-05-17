import { Component } from '@angular/core';
import { AuthService } from '../../auth/auth.service'; 

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent {
  constructor(public authService: AuthService) { }
}
