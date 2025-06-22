import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
// ... autres imports de composants ...
import { AuthGuard } from './shared/guards/auth.guard';
import { RoleGuard } from './shared/guards/role.guard';

// Layouts
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

// Components (assurez-vous que tous sont importés)
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ClientsComponent } from './pages/clients/clients.component';
import { ClientDetailsComponent } from './pages/clients/client-details/client-details.component';
import { ComptesComponent } from './pages/comptes/comptes.component';
import { ComptesDetailsComponent } from './pages/comptes/comptes-details/comptes-details.component';
import { GarantiesComponent } from './pages/garanties/garanties.component';
import { ChequeFileManagementComponent } from './pages/cheque-file-management/cheque-file-management.component';
import { CreditsFileManagementComponent } from './pages/credits-file-management/credits-file-management.component';
import { CautionsFileManagementComponent } from './pages/cautions-file-management/cautions-file-management.component';
import { LcFileManagementComponent } from './pages/lc-file-management/lc-file-management.component';
import { DossierRecouvrementListComponent } from './pages/dossiers/dossier-recouvrement-list/dossier-recouvrement-list.component';
import { DossierRecouvrementDetailsComponent } from './pages/dossiers/dossier-recouvrement-details/dossier-recouvrement-details.component';
import { DossierRecouvrementAddComponent } from './pages/dossiers/dossier-recouvrement-add/dossier-recouvrement-add.component';
import { DossierRecouvrementEditComponent } from './pages/dossiers/dossier-recouvrement-edit/dossier-recouvrement-edit.component';
import { RejetListComponent } from './pages/rejets/rejet-list/rejet-list.component';

// Admin Components
import { UserListComponent } from './admin/user-list/user-list.component';
import { UserEditComponent } from './admin/user-edit/user-edit.component';
import { AddUserComponent } from './admin/add-user/add-user.component';
import { RoleListComponent } from './admin/role-list/role-list.component';
import { AgenceListComponent } from './admin/agence/agence-list/agence-list.component';
import { HistoryComponent } from './admin/history/history.component';


const routes: Routes = [
  {
    path: 'auth', // Ou 'login' si vous préférez que le chemin soit juste /login
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      // Ajoutez ici d'autres routes liées à l'auth si nécessaire (ex: register, forgot-password)
    ]
  },
  {
    path: '', // Ce sera le layout principal pour les utilisateurs connectés
    component: MainLayoutComponent,
    canActivate: [AuthGuard], // Protège toutes les routes enfants
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // Redirige vers le dashboard par défaut après connexion
      { path: 'dashboard', component: DashboardComponent },
      { path: 'clients', component: ClientsComponent },
      { path: 'clients/details/:nni', component: ClientDetailsComponent },
      { path: 'comptes', component: ComptesComponent },
      { path: 'comptes/details/:nomCompte', component: ComptesDetailsComponent },
      { path: 'garanties', component: GarantiesComponent },
      { path: 'cautions-file-management', component: CautionsFileManagementComponent },
      { path: 'lc-file-management', component: LcFileManagementComponent },
      { path: 'cheque-files', component: ChequeFileManagementComponent },
      { path: 'credits-file-management', component: CreditsFileManagementComponent },
      { path: 'dossiers', component: DossierRecouvrementListComponent },
      { path: 'dossiers/view/:id', component: DossierRecouvrementDetailsComponent },
      { path: 'dossiers/add', component: DossierRecouvrementAddComponent },
      { path: 'dossier-recouvrement/modify/:id', component: DossierRecouvrementEditComponent },
      { path: 'archives', component: DossierRecouvrementListComponent},
      { path: 'rejets', component: RejetListComponent },
      {
        path: 'admin',
        canActivate: [RoleGuard], // Protège spécifiquement les routes admin
        data: { role: 'ROLE_ADMIN' },
        children: [
          { path: '', redirectTo: 'user-list', pathMatch: 'full' }, // Default admin page
          { path: 'user-list', component: UserListComponent },
          { path: 'user-edit', component: UserEditComponent },
          { path: 'user-edit/:id', component: UserEditComponent },
          { path: 'users/add', component: AddUserComponent },
          { path: 'roles', component: RoleListComponent },
          { path: 'agences', component: AgenceListComponent },
          { path: 'history', component: HistoryComponent },
        ]
      },
      // ... autres routes pour utilisateurs non-admin connectés
    ]
  },
  // Redirection par défaut vers la page de connexion si aucune autre route ne correspond
  // Ou une page "Not Found" sous MainLayoutComponent
  { path: '**', redirectTo: 'auth/login' } // Ou vers une page d'erreur 404
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}