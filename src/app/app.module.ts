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
import { RoleGuard } from './shared/guards/role.guard';
import { CreditsComponent } from './pages/credits/credits.component';
import { GarantiesComponent } from './pages/garanties/garanties.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    UserListComponent,
    UserEditComponent,
    AddUserComponent,
    CreditsComponent,
    GarantiesComponent
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
