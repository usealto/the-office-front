import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@auth0/auth0-angular';
import {
  appResolver,
  noSplashScreenResolver,
} from './app.resolver';
import { AppLayoutComponent } from './layout/app-layout/app-layout.component';
import { NoSmallScreenComponent } from './layout/no-small-screen/no-small-screen.component';
import { AltoRoutes } from './modules/shared/constants/routes';
import { noSmallScreen } from './no-small-screen.guard';
import { canActivateAdmin } from './roles.guard';
import { FlagBasedPreloadingStrategy } from './core/interceptors/module-loading-strategy';
import { CompaniesComponent } from './modules/companies/companies.component';
import { CompaniesCreateComponent } from './modules/companies-create/companies-create.component';
import { CompanyUsersComponent } from './modules/company-users/company-users.component';
import { CompanyUserComponent } from './modules/company-user/company-user.component';
import { UnauthorizedComponent } from './modules/unauthorized/unauthorized.component';
import { CreateUserTrainxComponent } from './modules/create-user-trainx/create-user-trainx.component';

const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    resolve: {
      storedData: appResolver,
    },
    children: [
      {
        path: AltoRoutes.home,
        component: CompaniesComponent,
      },
      {
        path: AltoRoutes.companies + '/create',
        component: CompaniesCreateComponent,
      },
      {
        path: AltoRoutes.companies + '/:id',
        component: CompaniesCreateComponent,
      },
      {
        path: AltoRoutes.companies + '/:id/users',
        component: CompanyUsersComponent,
      },
      {
        path: AltoRoutes.companies + '/:companyId/users/:userId',
        component: CompanyUserComponent,
      },
      {
        path: AltoRoutes.companies + '/:companyId/users/create/trainx',
        component: CreateUserTrainxComponent,
      },
      {
        path: '',
        pathMatch: 'full',
        component: CompaniesComponent,
      },
    ],
    canActivate: [AuthGuard, noSmallScreen, canActivateAdmin],
    canActivateChild: [AuthGuard, canActivateAdmin],
  },
  {
    path: AltoRoutes.noSmallScreen,
    canActivate: [AuthGuard],
    resolve: {
      splashscreen: noSplashScreenResolver,
    },
    component: NoSmallScreenComponent,
  },
  {
    path: AltoRoutes.translation,
    loadChildren: () => import('./core/utils/i18n/translation.module').then((m) => m.TranslationModule),
  },
  {
    path: '**',
    redirectTo: AltoRoutes.notFound,
  },
  {
    path: "unauthorized",
    component: UnauthorizedComponent
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: FlagBasedPreloadingStrategy,
      scrollPositionRestoration: 'top',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
