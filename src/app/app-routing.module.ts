import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { UserListComponent } from './admin/user-list/user-list.component';
import { UserEditComponent } from './admin/user-edit/user-edit.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { AddUserComponent } from './admin/add-user/add-user.component';
import { RoleGuard } from './shared/guards/role.guard';

import { ClientsComponent } from './pages/clients/clients.component';
import { ComptesComponent } from './pages/comptes/comptes.component';
import { CreditsComponent } from './pages/credits/credits.component';
import { GarantiesComponent } from './pages/garanties/garanties.component';

const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'auth/login', component: LoginComponent },
  { path: 'admin/user-list', component: UserListComponent, canActivate: [AuthGuard, RoleGuard], data: { role: 'ADMIN' } },
  { path: 'admin/user-edit', component: UserEditComponent, canActivate: [AuthGuard, RoleGuard], data: { role: 'ADMIN' } },
  { path: 'admin/user-edit/:id', component: UserEditComponent, canActivate: [AuthGuard, RoleGuard], data: { role: 'ADMIN' } },
  { path: 'admin/users/add', component: AddUserComponent, canActivate: [AuthGuard, RoleGuard], data: { role: 'ADMIN' } },
  { path: 'clients', component: ClientsComponent, canActivate: [AuthGuard, RoleGuard], data: { role: 'DO' } },
  { path: 'comptes', component: ComptesComponent, canActivate: [AuthGuard, RoleGuard], data: { role: 'DC' } },
  { path: 'credits', component: CreditsComponent, canActivate: [AuthGuard, RoleGuard], data: { role: 'DO' } },
  { path: 'garanties', component: GarantiesComponent, canActivate: [AuthGuard, RoleGuard], data: { role: 'DO' } },
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}