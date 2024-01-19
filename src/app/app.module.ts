import * as Sentry from '@sentry/angular-ivy';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, ErrorHandler, LOCALE_ID, NgModule } from '@angular/core';
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
import { CoreModule } from './core/core.module';
import { ApiInterceptor } from './core/interceptors/api.interceptor';
import { AppErrorHandler } from './core/interceptors/app-error.handler';
import { ToastComponent } from './core/toast/toast.component';
import { LocaleService, localeIdFactory, localeInitializer } from './core/utils/i18n/locale.service';
import { LoadingModule } from './core/utils/loading/loading.module';
import { AppLayoutComponent } from './layout/app-layout/app-layout.component';
import { AppComponent } from './layout/app/app.component';
import { MenuComponent } from './layout/menu/menu.component';
import { NoSmallScreenComponent } from './layout/no-small-screen/no-small-screen.component';
import { NotFoundComponent } from './layout/not-found/not-found.component';
import { CompanyUsersComponent } from './modules/company-users/company-users.component';
import { UserFormComponent } from './modules/company-users/user-form/user-form.component';
import { CompanyFormComponent } from './modules/home/company-form/company-form.component';
import { HomeComponent } from './modules/home/home.component';
import { SharedModule } from './modules/shared/shared.module';
import { UnauthorizedComponent } from './modules/unauthorized/unauthorized.component';
import { UserComponent } from './modules/user/user.component';
import { BreadcrumbComponent } from './layout/breadcrumb/breadcrumb.component';
import { Router } from '@angular/router';
@NgModule({
  declarations: [
    HomeComponent,
    AppComponent,
    AppLayoutComponent,
    MenuComponent,
    NotFoundComponent,
    NoSmallScreenComponent,
    CompanyUsersComponent,
    UserComponent,
    UnauthorizedComponent,
    CompanyFormComponent,
    UserFormComponent,
    BreadcrumbComponent,
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
      provide: Sentry.TraceService,
      deps: [Router],
    },
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
      deps: [LOCALE_ID, Sentry.TraceService],
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
