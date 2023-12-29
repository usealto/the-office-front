import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { of, switchMap, tap } from 'rxjs';

import { AltoRoutes } from '../../modules/shared/constants/routes';
import { Company } from '../models/company.model';
import { setBreadcrumbItems } from '../store/root/root.action';
import * as FromRoot from '../store/store.reducer';
import { EmojiName } from '../utils/emoji/data';

export interface ICompanyUsersData {
  company: Company;
}

export const companyUsersResolver: ResolveFn<ICompanyUsersData> = (activatedRoute) => {
  const store = inject<Store<FromRoot.AppState>>(Store<FromRoot.AppState>);

  return store.select(FromRoot.selectCompanies).pipe(
    switchMap(({ data: companiesById }) => {
      return of({ company: companiesById.get(activatedRoute.params['id']) as Company });
    }),
    tap(({ company }) => {
      store.dispatch(
        setBreadcrumbItems({
          breadcrumbItems: [
            { name: 'Home', url: AltoRoutes.home, icon: EmojiName.House },
            {
              name: company.name,
              url: `${AltoRoutes.companies}/${company.id}`,
              icon: EmojiName.OfficeBuilding,
            },
          ],
        }),
      );
    }),
  );
};
