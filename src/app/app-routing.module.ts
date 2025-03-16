import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { UserListComponent } from './admin/user-list/user-list.component';
import { UserEditComponent } from './admin/user-edit/user-edit.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { RoleGuard } from './shared/guards/role.guard';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

import { AddUserComponent } from './admin/add-user/add-user.component';
import { DossierRecouvrementListComponent } from './pages/dossiers/dossier-recouvrement-list/dossier-recouvrement-list.component';
import { DossierRecouvrementDetailsComponent } from './pages/dossiers/dossier-recouvrement-details/dossier-recouvrement-details.component';
import { DossierRecouvrementAddComponent } from './pages/dossiers/dossier-recouvrement-add/dossier-recouvrement-add.component';
import { DossierRecouvrementEditComponent } from './pages/dossiers/dossier-recouvrement-edit/dossier-recouvrement-edit.component';
import { ClientsComponent } from './pages/clients/clients.component';
import { ComptesComponent } from './pages/comptes/comptes.component';
import { ClientDetailsComponent } from './pages/clients/client-details/client-details.component';
import { ComptesDetailsComponent } from './pages/comptes/comptes-details/comptes-details.component';
import { RoleListComponent } from './admin/role-list/role-list.component';
import { AgenceListComponent } from './admin/agence/agence-list/agence-list.component';
import { GarantiesComponent } from './pages/garanties/garanties.component';
import { HistoryComponent } from './admin/history/history.component';
<<<<<<< HEAD
import { ChequeFileManagementComponent } from './pages/cheque-file-management/cheque-file-management.component';
import { CreditsFileManagementComponent } from './pages/credits-file-management/credits-file-management.component';
import { CautionsFileManagementComponent } from './pages/cautions-file-management/cautions-file-management.component';
import { LcFileManagementComponent } from './pages/lc-file-management/lc-file-management.component';

=======
>>>>>>> 9c329b3c4dcffe8ef09adf210b00525e5ab509b9
const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'auth/login', component: LoginComponent },
 
  { path: 'clients', component: ClientsComponent,canActivate: [AuthGuard]},
  { path: 'comptes', component: ComptesComponent,canActivate: [AuthGuard]},
  { path: 'dashboard', component: DashboardComponent ,canActivate: [AuthGuard]},
  { path: 'garanties', component: GarantiesComponent }, // Route pour la page Garanties
  {
    path: 'cautions-file-management', // Chemin de la route
    component: CautionsFileManagementComponent, // Composant à afficher
  },
  {
    path: 'lc-file-management',
    component: LcFileManagementComponent,
  },
  { path: 'clients/details/:nni', component: ClientDetailsComponent,canActivate: [AuthGuard] }
 ,   { path: 'comptes/details/:nomCompte', component: ComptesDetailsComponent,canActivate: [AuthGuard] }
,
 {
    path: 'admin', 
    children: [
      { path: 'user-list', component: UserListComponent },
      { path: 'user-edit', component: UserEditComponent },
      { path: 'user-edit/:id', component: UserEditComponent },
      { path: 'users/add', component: AddUserComponent },
      { path: 'roles', component: RoleListComponent },
      { path: 'agences', component: AgenceListComponent },
      { path: 'history', component: HistoryComponent },
    ],
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ROLE_ADMIN' }
  },
  { path: 'cheque-files', component: ChequeFileManagementComponent },

  // Non-admin routes - accessible by all authenticated users
 
  { 
    path: 'dossiers', 
    component: DossierRecouvrementListComponent
    ,canActivate: [AuthGuard]
  },
  { 
    path: 'dossiers/view/:id', 
    component: DossierRecouvrementDetailsComponent
    ,canActivate: [AuthGuard]
  },
  {
    path: 'credits-file-management', // URL pour accéder au composant
    component: CreditsFileManagementComponent, // Composant à afficher
  },

  {
    path: 'dossiers/add',
    component: DossierRecouvrementAddComponent
    ,canActivate: [AuthGuard]
  },
  { 
    path: 'dossier-recouvrement/modify/:id', 
    component: DossierRecouvrementEditComponent
    ,canActivate: [AuthGuard]
  },
  

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  
  exports: [RouterModule]
})
export class AppRoutingModule {}