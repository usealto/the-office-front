import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { catchError, combineLatest, map, of, switchMap } from 'rxjs';

import { CompaniesRestService } from '../../modules/companies/service/companies-rest.service';
import { UsersRestService } from '../../modules/profile/services/users-rest.service';
import { AltoRoutes } from '../../modules/shared/constants/routes';
import { Company } from '../models/company.model';
import { addCompanies } from '../store/root/root.action';
import * as FromRoot from '../store/store.reducer';
import { ToastService } from '../toast/toast.service';

export const CompanyGuard: CanActivateFn = (activatedRoute) => {
  const store = inject<Store<FromRoot.AppState>>(Store<FromRoot.AppState>);
  const companiesRestService = inject<CompaniesRestService>(CompaniesRestService);
  const usersRestService = inject<UsersRestService>(UsersRestService);
  const toastService = inject<ToastService>(ToastService);
  const router = inject<Router>(Router);

  return store.select(FromRoot.selectCompanies).pipe(
    switchMap(({ data: companiesById }) => {
      const company = companiesById.get(activatedRoute.params['id']);

      if (!company) {
        return combineLatest([
          companiesRestService.getCompanyById(activatedRoute.params['id']),
          usersRestService.getUsersByCompanyId(activatedRoute.params['id']),
        ]).pipe(
          switchMap(([company, users]) => {
            const updatedCompany = new Company({
              ...company,
              users: users.map((user) => user.rawData),
            });
            store.dispatch(addCompanies({ companies: [updatedCompany] }));
            return store.select(FromRoot.selectCompanies);
          }),
          map(({ data: companiesById }) => companiesById.get(activatedRoute.params['id']) as Company),
        );
      }

      return of(company);
    }),
    map((company) => (company ? true : false)),
    catchError(() => {
      toastService.show({
        text: 'Error fetching company',
        type: 'danger',
      });
      router.navigate(['/', AltoRoutes.home]);
      return of(false);
    }),
  );
};
