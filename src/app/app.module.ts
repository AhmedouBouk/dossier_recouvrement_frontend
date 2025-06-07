import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { UserListComponent } from './admin/user-list/user-list.component';
import { UserEditComponent } from './admin/user-edit/user-edit.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiInterceptorService } from './shared/services/api-interceptor.service';
import { AddUserComponent } from './admin/add-user/add-user.component';
import { DossierRecouvrementListComponent } from './pages/dossiers/dossier-recouvrement-list/dossier-recouvrement-list.component';
import { DossierRecouvrementDetailsComponent } from './pages/dossiers/dossier-recouvrement-details/dossier-recouvrement-details.component';
import { DossierRecouvrementAddComponent } from './pages/dossiers/dossier-recouvrement-add/dossier-recouvrement-add.component';
import { DossierRecouvrementEditComponent } from './pages/dossiers/dossier-recouvrement-edit/dossier-recouvrement-edit.component';
import { RoleGuard } from './shared/guards/role.guard';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { RouterModule } from '@angular/router';
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
import { ClientDetailsComponent } from './pages/clients/client-details/client-details.component';
import { ComptesDetailsComponent } from './pages/comptes/comptes-details/comptes-details.component';
import { RoleListComponent } from './admin/role-list/role-list.component';
import { AgenceModule } from './admin/agence/agence.module';
import { NavigationHeaderComponent } from './admin/navigation-header/navigation-header.component';
import { SharedModule } from './shared/shared.module';
import { GarantiesComponent } from './pages/garanties/garanties.component';
import { HistoryComponent } from './admin/history/history.component';
import { ChequeFileManagementComponent } from './pages/cheque-file-management/cheque-file-management.component';
import { CreditsFileManagementComponent } from './pages/credits-file-management/credits-file-management.component';
import { CautionsFileManagementComponent } from './pages/cautions-file-management/cautions-file-management.component';
import { LcFileManagementComponent } from './pages/lc-file-management/lc-file-management.component';
import { AuthInterceptor } from './interceptors/AuthInterceptor';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    UserListComponent,
    UserEditComponent,
    AddUserComponent,
    SidebarComponent,
    NavbarComponent,
    DashboardComponent,
    ClientDetailsComponent,
    ComptesDetailsComponent,
    RoleListComponent,
    GarantiesComponent,
    HistoryComponent,
    AuthLayoutComponent,
    MainLayoutComponent,
    ChequeFileManagementComponent,
    CreditsFileManagementComponent,
    LcFileManagementComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    RouterModule,
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
    BrowserAnimationsModule,
    ReactiveFormsModule,
    DossierRecouvrementListComponent,
    DossierRecouvrementDetailsComponent,
    DossierRecouvrementAddComponent,
    DossierRecouvrementEditComponent,
    CautionsFileManagementComponent,
    AgenceModule,
    SharedModule
  ],
  exports: [
    ChequeFileManagementComponent,
    CautionsFileManagementComponent
  ],
  providers: [
    RoleGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptorService,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent],

})
export class AppModule { }