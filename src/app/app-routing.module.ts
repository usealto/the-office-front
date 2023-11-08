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
        component: NoSmallScreenComponent,
      },
    ],
    canActivate: [AuthGuard, noSmallScreen],
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
