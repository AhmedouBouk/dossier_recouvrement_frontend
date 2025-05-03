import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavigationHeaderComponent } from '../navigation-header/navigation-header.component';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css'],
  standalone: true,
  imports: [RouterModule, NavigationHeaderComponent]
})
export class AdminLayoutComponent {
  constructor() { }
}
