import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { catchError, map, of, switchMap } from 'rxjs';

import { Company } from '../models/company.model';
import * as FromRoot from '../store/store.reducer';
import { ToastService } from '../toast/toast.service';

export const UserGuard: CanActivateFn = (activatedRoute) => {
  const store = inject<Store<FromRoot.AppState>>(Store<FromRoot.AppState>);
  const toastService = inject<ToastService>(ToastService);
  const router = inject<Router>(Router);

  return store.select(FromRoot.selectCompanies).pipe(
    switchMap(({ data: companiesById }) => {
      const company = companiesById.get(activatedRoute.params['id']) as Company;
      return of(company.usersById.get(activatedRoute.params['userId']));
    }),
    map((user) => (user ? true : false)),
    catchError(() => {
      toastService.show({
        text: 'User not found',
        type: 'danger',
      });
      router.navigate(['/companies/' + activatedRoute.params['id']]);
      return of(false);
    }),
  );
};
