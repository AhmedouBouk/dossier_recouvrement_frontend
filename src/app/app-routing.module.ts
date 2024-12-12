import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { UserListComponent } from './admin/user-list/user-list.component';
import { UserEditComponent } from './admin/user-edit/user-edit.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { AddUserComponent } from './admin/add-user/add-user.component';

const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'auth/login', component: LoginComponent },
  { path: 'admin/user-list', component: UserListComponent, canActivate: [AuthGuard] },
  { path: 'admin/user-edit', component: UserEditComponent, canActivate: [AuthGuard] },
  { path: 'admin/user-edit/:id', component: UserEditComponent, canActivate: [AuthGuard] },
  { path: 'admin/users/add', component: AddUserComponent ,canActivate: [AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
