import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@auth0/auth0-angular';
import {
  appResolver,
  noSplashScreenResolver,
} from './app.resolver';
import { AppLayoutComponent } from './layout/app-layout/app-layout.component';
import { JwtComponent } from './layout/jwt/jwt.component';
import { NoSmallScreenComponent } from './layout/no-small-screen/no-small-screen.component';
import { NotFoundComponent } from './layout/not-found/not-found.component';
import { AltoRoutes } from './modules/shared/constants/routes';
import { noSmallScreen } from './no-small-screen.guard';
import { canActivateLead } from './roles.guard';
import { startup } from './startup.guard';
import { FlagBasedPreloadingStrategy } from './core/interceptors/module-loading-strategy';

const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    resolve: {
      storedData: appResolver,
    },
    children: [
      {
        path: AltoRoutes.user,
        canActivate: [startup],
        children: [
          {
            path: AltoRoutes.profile,
            loadChildren: () => import('./modules/profile/profile.module').then((m) => m.ProfileModule),
          },
        ],
      },
      {
        path: AltoRoutes.lead,
        canActivate: [canActivateLead, startup],
        children: [
          { path: '', redirectTo: AltoRoutes.leadHome, pathMatch: 'full' },
          {
            path: AltoRoutes.profile,
            loadChildren: () => import('./modules/profile/profile.module').then((m) => m.ProfileModule),
          },
        ],
      },
      {
        path: AltoRoutes.notFound,
        component: NotFoundComponent,
      },
    ],
    canActivate: [AuthGuard, noSmallScreen],
    canActivateChild: [AuthGuard],
  },
  {
    path: '',
    canActivate: [AuthGuard],
    resolve: {
      splashscreen: noSplashScreenResolver,
    },
    children: [
      {
        path: 'jwt',
        component: JwtComponent,
      },
      {
        path: AltoRoutes.noSmallScreen,
        component: NoSmallScreenComponent,
      },
    ],
  },
  {
    path: AltoRoutes.translation,
    loadChildren: () => import('./core/utils/i18n/translation.module').then((m) => m.TranslationModule),
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
