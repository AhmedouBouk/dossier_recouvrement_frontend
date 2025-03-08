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

const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'auth/login', component: LoginComponent },
 
  { path: 'clients', component: ClientsComponent,canActivate: [AuthGuard]},
  { path: 'comptes', component: ComptesComponent,canActivate: [AuthGuard]},
  { path: 'dashboard', component: DashboardComponent ,canActivate: [AuthGuard]},
  { path: 'garanties', component: GarantiesComponent }, // Route pour la page Garanties

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