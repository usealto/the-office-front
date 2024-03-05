import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@auth0/auth0-angular';

import { AppGuard } from './core/guards/app.guard';
import { CompanyGuard } from './core/guards/company.guard';
import { UserGuard } from './core/guards/user.guard';
import { FlagBasedPreloadingStrategy } from './core/interceptors/module-loading-strategy';
import { appResolver } from './core/resolvers/app.resolver';
import { companyUsersResolver } from './core/resolvers/companyUsers.resolver';
import { EResolverData } from './core/resolvers/resolvers.service';
import { userResolver } from './core/resolvers/user.resolver';
import { AppLayoutComponent } from './layout/app-layout/app-layout.component';
import { CompanyUsersComponent } from './modules/company-users/company-users.component';
import { HomeComponent } from './modules/home/home.component';
import { AltoRoutes } from './modules/shared/constants/routes';
import { UnauthorizedComponent } from './modules/unauthorized/unauthorized.component';
import { UserComponent } from './modules/user/user.component';
import { NotFoundComponent } from './layout/not-found/not-found.component';
import { UnknownErrorComponent } from './modules/unknown-error/unknown-error.component';

const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    runGuardsAndResolvers: 'always',
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
        runGuardsAndResolvers: 'always',
        canActivateChild: [CompanyGuard],
        resolve: {
          [EResolverData.CompanyUsersData]: companyUsersResolver,
        },
        children: [
          {
            path: '',
            pathMatch: 'full',
            component: CompanyUsersComponent,
          },
          {
            path: AltoRoutes.user + '/:userId',
            canActivate: [UserGuard],
            resolve: {
              [EResolverData.UserData]: userResolver,
            },
            component: UserComponent,
          },
        ],
      },
      {
        path: '',
        pathMatch: 'full',
        component: HomeComponent,
      },
    ],
  },
  {
    path: AltoRoutes.unauthorized,
    component: UnauthorizedComponent,
  },
  {
    path: AltoRoutes.unkownError,
    component: UnknownErrorComponent,
  },
  {
    path: AltoRoutes.notFound,
    component: NotFoundComponent,
  },
  {
    path: '**',
    redirectTo: AltoRoutes.notFound,
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
