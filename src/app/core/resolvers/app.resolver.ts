import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, map, of, switchMap } from 'rxjs';

import { UsersRestService } from '../../modules/profile/services/users-rest.service';
import { Company } from '../models/company.model';
import { User } from '../models/user.model';
import * as FromRoot from '../store/store.reducer';
import { EmojiMap, emojiData } from '../utils/emoji/data';
import { CompaniesRestService } from '../../modules/companies/service/companies-rest.service';
import { setCompanies } from '../store/root/root.action';

export interface IAppData {
  me: User;
  companiesById: Map<string, Company>;
}

export const appResolver: ResolveFn<IAppData> = () => {
  emojiData.forEach((d) => EmojiMap.set(d.id, d));

  const store = inject<Store<FromRoot.AppState>>(Store<FromRoot.AppState>);
  const usersRestService = inject<UsersRestService>(UsersRestService);
  const companiesRestService = inject<CompaniesRestService>(CompaniesRestService);

  return combineLatest([store.select(FromRoot.selectUserMe), store.select(FromRoot.selectCompanies)]).pipe(
    switchMap(([timestampedMe, timestampedCompanies]) => {
      return combineLatest([
        of(timestampedMe),
        timestampedCompanies.needsUpdate()
          ? combineLatest([companiesRestService.getCompanies(), usersRestService.getUsers()]).pipe(
              switchMap(([companies, users]) => {
                const companiesWithUsers = companies.map((c) => {
                  c.users = users.filter((u) => u.companyId === c.id);
                  return c;
                });

                store.dispatch(setCompanies({ companies: companiesWithUsers }));
                return store.select(FromRoot.selectCompanies);
              }),
            )
          : of(timestampedCompanies),
      ]);
    }),
    map(([{ data: me }, { data: companiesById }]) => ({ me, companiesById })),
  );
};
