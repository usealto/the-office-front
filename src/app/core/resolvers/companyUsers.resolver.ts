import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, map, of, switchMap } from 'rxjs';

import { CompaniesRestService } from '../../modules/companies/service/companies-rest.service';
import { UsersRestService } from '../../modules/profile/services/users-rest.service';
import { Company } from '../models/company.model';
import { addCompanies } from '../store/root/root.action';
import * as FromRoot from '../store/store.reducer';

export interface ICompanyUsersData {
  company: Company;
}

export const companyUsersResolver: ResolveFn<ICompanyUsersData> = (activatedRoute) => {
  const store = inject<Store<FromRoot.AppState>>(Store<FromRoot.AppState>);
  const companiesRestService = inject<CompaniesRestService>(CompaniesRestService);
  const usersRestService = inject<UsersRestService>(UsersRestService);

  return store.select(FromRoot.selectCompanies).pipe(
    switchMap(({ data: companiesById }) => {
      const company = companiesById.get(activatedRoute.params['id']);

      if (!company) {
        return combineLatest([
          companiesRestService.getCompanyById(activatedRoute.params['id']),
          usersRestService.getUsersByCompanyId(activatedRoute.params['id']),
        ]).pipe(
          map(([company, users]) => {
            const updatedCompany = new Company({
              ...company,
              users: users.map((user) => user.rawData),
            });
            store.dispatch(addCompanies({ companies: [updatedCompany] }));
            return { company };
          }),
        );
      }
      return of({ company });
    }),
  );
};
