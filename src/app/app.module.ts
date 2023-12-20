import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, ErrorHandler, LOCALE_ID, NgModule, isDevMode } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AuthHttpInterceptor, AuthModule } from '@auth0/auth0-angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { ApiModule as ApiModule_trainx, BASE_PATH as BASE_PATH_TRAINX } from '@usealto/sdk-ts-angular';
import {
  ApiModule as ApiModule_theoffice,
  BASE_PATH as BASE_PATH_THEOFFICE,
} from '@usealto/the-office-sdk-angular';
import { environment } from 'src/environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { ApiErrorInterceptor } from './core/interceptors/api-error.interceptor';
import { ApiInterceptor } from './core/interceptors/api.interceptor';
import { AppErrorHandler } from './core/interceptors/app-error.handler';
import { MsgModule } from './core/message/msg.module';
import { ToastComponent } from './core/toast/toast.component';
import { LocaleService, localeIdFactory, localeInitializer } from './core/utils/i18n/locale.service';
import { LoadingModule } from './core/utils/loading/loading.module';
import { AppLayoutComponent } from './layout/app-layout/app-layout.component';
import { AppComponent } from './layout/app/app.component';
import { MenuComponent } from './layout/menu/menu.component';
import { NoSmallScreenComponent } from './layout/no-small-screen/no-small-screen.component';
import { NotFoundComponent } from './layout/not-found/not-found.component';
import { SharedModule } from './modules/shared/shared.module';
import { CompaniesComponent } from './modules/companies/companies.component';
import { CompaniesCreateComponent } from './modules/companies-create/companies-create.component';
import { CompanyUsersComponent } from './modules/company-users/company-users.component';
import { CompanyUserComponent } from './modules/company-user/company-user.component';
import { UnauthorizedComponent } from './modules/unauthorized/unauthorized.component';
import { CreateUserTrainxComponent } from './modules/create-user-trainx/create-user-trainx.component';
import { UserTrainxComponent } from './modules/company-user/user-trainx/user-trainx.component';
import { CoreModule } from './core/core.module';
import { HomeComponent } from './modules/home/home.component';
import { EditCompanyComponent } from './modules/home/edit-company/edit-company.component';
@NgModule({
  declarations: [
    HomeComponent,
    AppComponent,
    AppLayoutComponent,
    MenuComponent,
    NotFoundComponent,
    NoSmallScreenComponent,
    CompaniesComponent,
    CompaniesCreateComponent,
    CompanyUsersComponent,
    CompanyUserComponent,
    UnauthorizedComponent,
    CreateUserTrainxComponent,
    UserTrainxComponent,
    EditCompanyComponent,
  ],
  imports: [
    CoreModule,
    ApiModule_trainx,
    ApiModule_theoffice,
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    NgbModule,
    NgSelectModule,
    LoadingModule,
    SharedModule,
    MsgModule,
    AuthModule.forRoot({
      domain: environment.auth0Domain,
      clientId: environment.auth0ClientId,
      useRefreshTokens: true,
      cacheLocation: 'localstorage',
      authorizationParams: {
        audience: environment.audience,
        scope: 'openid profile email offline_access',
        redirect_uri: window.location.origin,
      },
      httpInterceptor: {
        allowedList: [`${environment.trainxapiURL}/*`, `${environment.theofficeURL}/*`],
      },
    }),
    ToastComponent,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthHttpInterceptor,
      multi: true,
    },
    {
      provide: BASE_PATH_TRAINX,
      useValue: environment.trainxapiURL,
    },
    {
      provide: BASE_PATH_THEOFFICE,
      useValue: environment.theofficeURL,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiErrorInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor,
      multi: true,
    },
    {
      provide: ErrorHandler,
      useClass: AppErrorHandler,
    },
    { provide: LOCALE_ID, useFactory: localeIdFactory, deps: [LocaleService] },
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: localeInitializer,
      deps: [LOCALE_ID],
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
