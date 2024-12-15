import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { UserListComponent } from './admin/user-list/user-list.component';
import { UserEditComponent } from './admin/user-edit/user-edit.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { RoleGuard } from './shared/guards/role.guard';
import { AddUserComponent } from './admin/add-user/add-user.component';
import { DossiersRecouvrementListComponent } from './pages/dossiers-recouvrement/dossiers-recouvrement-list/dossiers-recouvrement-list.component';
import { DossiersRecouvrementDetailComponent } from './pages/dossiers-recouvrement/dossiers-recouvrement-detail/dossiers-recouvrement-detail.component';
import { DossiersRecouvrementEditComponent } from './pages/dossiers-recouvrement/dossiers-recouvrement-edit/dossiers-recouvrement-edit.component';
import { ClientsComponent } from './pages/clients/clients.component';
import { ComptesComponent } from './pages/comptes/comptes.component';
import { CreditsComponent } from './pages/credits/credits.component';
import { GarantiesComponent } from './pages/garanties/garanties.component';

const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'auth/login', component: LoginComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}