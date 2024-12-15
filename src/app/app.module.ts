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
    FormsModule
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
