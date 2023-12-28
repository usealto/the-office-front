import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { of, switchMap } from 'rxjs';

import { Company } from '../models/company.model';
import * as FromRoot from '../store/store.reducer';

export interface ICompanyUsersData {
  company: Company;
}

export const companyUsersResolver: ResolveFn<ICompanyUsersData> = (activatedRoute) => {
  const store = inject<Store<FromRoot.AppState>>(Store<FromRoot.AppState>);

  return store.select(FromRoot.selectCompanies).pipe(
    switchMap(({ data: companiesById }) => {
      return of({ company: companiesById.get(activatedRoute.params['id']) as Company });
    }),
  );
};
