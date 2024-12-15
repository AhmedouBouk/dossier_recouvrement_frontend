import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { UserListComponent } from './admin/user-list/user-list.component';
import { UserEditComponent } from './admin/user-edit/user-edit.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ApiInterceptorService } from './shared/services/api-interceptor.service';
import { AddUserComponent } from './admin/add-user/add-user.component';
import { DossiersRecouvrementListComponent } from './pages/dossiers-recouvrement/dossiers-recouvrement-list/dossiers-recouvrement-list.component';
import { DossiersRecouvrementDetailComponent } from './pages/dossiers-recouvrement/dossiers-recouvrement-detail/dossiers-recouvrement-detail.component';
import { DossiersRecouvrementEditComponent } from './pages/dossiers-recouvrement/dossiers-recouvrement-edit/dossiers-recouvrement-edit.component';
import { RoleGuard } from './shared/guards/role.guard';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    UserListComponent,
    UserEditComponent,
    AddUserComponent,
    DossiersRecouvrementListComponent,
    DossiersRecouvrementDetailComponent,
    DossiersRecouvrementEditComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    BrowserAnimationsModule
  ],
  providers: [
    RoleGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptorService,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }