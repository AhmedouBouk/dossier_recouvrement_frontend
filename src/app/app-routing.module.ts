import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { UserListComponent } from './admin/user-list/user-list.component';
import { UserEditComponent } from './admin/user-edit/user-edit.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { RoleGuard } from './shared/guards/role.guard';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

import { AddUserComponent } from './admin/add-user/add-user.component';
import { DossiersRecouvrementListComponent } from './pages/dossiers-recouvrement/dossiers-recouvrement-list/dossiers-recouvrement-list.component';
import { DossiersRecouvrementDetailComponent } from './pages/dossiers-recouvrement/dossiers-recouvrement-detail/dossiers-recouvrement-detail.component';
import { DossiersRecouvrementEditComponent } from './pages/dossiers-recouvrement/dossiers-recouvrement-edit/dossiers-recouvrement-edit.component';
import { ClientsComponent } from './pages/clients/clients.component';
import { ComptesComponent } from './pages/comptes/comptes.component';
import { CreditComponent } from './pages/credits/credit/credit.component';
import { GarantiesComponent } from './pages/garanties/garanties.component';
import { CreditAddComponent } from './pages/credits/credits-add/credits-add.component';
import { CreditEditComponent } from './pages/credits/credits-edit/credits-edit.component';

const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'auth/login', component: LoginComponent },
 
  { path: 'clients', component: ClientsComponent},
  { path: 'comptes', component: ComptesComponent},
  { path: 'dashboard', component: DashboardComponent },
 

  { 
    path: 'admin', 
    children: [
      { path: 'user-list', component: UserListComponent },
      { path: 'user-edit', component: UserEditComponent },
      { path: 'user-edit/:id', component: UserEditComponent },
      { path: 'users/add', component: AddUserComponent }
    ],
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ADMIN' }
  },

  // Non-admin routes - accessible by all authenticated users
 
  { 
    path: 'dossier-recouvrement', 
    component: DossiersRecouvrementListComponent,
  },
  { 
    path: 'dossier-recouvrement/view/:id', 
    component: DossiersRecouvrementDetailComponent,
  },
  { 
    path: 'dossier-recouvrement/modify/:id', 
    component: DossiersRecouvrementEditComponent,
  },
  {
    path: 'credits',
    component: CreditComponent,
  },
  {
    path: 'credits/add',
    component: CreditAddComponent,  // Note: Changed from CreditComponent
  },
  {
    path: 'credits/edit/:id',  // Added :id parameter
    component: CreditEditComponent,  // Note: Changed from CreditComponent
  },
  {
    path: 'garanties',
    component: GarantiesComponent,
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}