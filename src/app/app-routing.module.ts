import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@auth0/auth0-angular';

import { AppGuard } from './core/guards/app.guard';
import { FlagBasedPreloadingStrategy } from './core/interceptors/module-loading-strategy';
import { appResolver } from './core/resolvers/app.resolver';
import { AppLayoutComponent } from './layout/app-layout/app-layout.component';
import { HomeComponent } from './modules/home/home.component';
import { AltoRoutes } from './modules/shared/constants/routes';
import { UnauthorizedComponent } from './modules/unauthorized/unauthorized.component';
import { CompanyUsersComponent } from './modules/company-users/company-users.component';
import { companyUsersResolver } from './core/resolvers/companyUsers.resolver';
import { EResolverData } from './core/resolvers/resolvers.service';

const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [AuthGuard, AppGuard],
    resolve: {
      [EResolverData.AppData]: appResolver,
    },
    canActivateChild: [AuthGuard, AppGuard],
    children: [
      {
        path: AltoRoutes.home,
        component: HomeComponent,
      },
      {
        path: AltoRoutes.companies + '/:id',
        component: CompanyUsersComponent,
        resolve: {
          [EResolverData.CompanyUsersData]: companyUsersResolver,
        },
      },
      // {
      //   path: AltoRoutes.companies + '/create',
      //   component: CompaniesCreateComponent,
      // },
      // {
      //   path: AltoRoutes.companies + '/:id/users',
      //   component: CompanyUsersComponent,
      // },
      // {
      //   path: AltoRoutes.companies + '/:companyId/users/:userId',
      //   component: CompanyUserComponent,
      // },
      // {
      //   path: AltoRoutes.companies + '/:companyId/users/create/billing-admin',
      //   component: CreateBillingAdminComponent,
      // },
      // {
      //   path: AltoRoutes.companies + '/:companyId/users/create/trainx',
      //   component: CreateUserTrainxComponent,
      // },
      {
        path: '',
        pathMatch: 'full',
        component: HomeComponent,
      },
    ],
  },
  {
    path: '**',
    redirectTo: AltoRoutes.notFound,
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent,
  },
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
