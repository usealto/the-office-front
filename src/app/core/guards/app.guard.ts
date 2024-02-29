import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { catchError, map, of, switchMap } from 'rxjs';

import { UsersRestService } from '../../modules/profile/services/users-rest.service';
import { AltoRoutes } from '../../modules/shared/constants/routes';
import { setUserMe } from '../store/root/root.action';
import * as FromRoot from '../store/store.reducer';

export const AppGuard: CanActivateFn = () => {
  const store = inject<Store<FromRoot.AppState>>(Store<FromRoot.AppState>);
  const usersRestService = inject<UsersRestService>(UsersRestService);
  const router = inject<Router>(Router);

  return store.select(FromRoot.selectUserMe).pipe(
    switchMap((me) => {
      return me.needsUpdate()
        ? usersRestService.getMe().pipe(
            map((user) => {
              if (user) {
                store.dispatch(setUserMe({ user }));
              }
              return user;
            }),
          )
        : of(me.data);
    }),
    map((user) => {
      if (!user || !user.isAltoAdmin()) {
        router.navigate(['/', AltoRoutes.unauthorized]);
        return false;
      }
      return true;
    }),
    catchError((e) => {     
      router.navigate(['/', AltoRoutes.unkownError, { error: e?.message }]);
      return of(false);
    }),
  );
};
