import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, map, of, switchMap, tap } from 'rxjs';

import { UsersRestService } from '../../modules/profile/services/users-rest.service';
import { Company } from '../models/company.model';
import { Auth0UserSettings, User } from '../models/user.model';
import { addBreadcrumbItem, setUser } from '../store/root/root.action';
import * as FromRoot from '../store/store.reducer';
import { AltoRoutes } from '../../modules/shared/constants/routes';
import { EmojiName } from '../utils/emoji/data';
import { Application } from '../models/application.model';

export interface IUserData {
  user: User;
  applications: Application[];
}

export const userResolver: ResolveFn<IUserData> = (activatedRoute) => {
  const store = inject<Store<FromRoot.AppState>>(Store<FromRoot.AppState>);
  const usersRestService = inject<UsersRestService>(UsersRestService);

  return combineLatest([
    store.select(FromRoot.selectCompanies),
    store.select(FromRoot.selectApplications),
  ]).pipe(
    switchMap(([{ data: companiesById }, { data: applicationsById }]) => {
      const company = companiesById.get(activatedRoute.params['id']) as Company;
      const user = company.getUserById(activatedRoute.params['userId']) as User;
      const applications = Array.from(applicationsById.values());

      if (!user.auth0Settings.infos) {
        return usersRestService.getAuth0User(user.auth0Settings.id).pipe(
          switchMap((auth0user) => {
            const auth0Settings = new Auth0UserSettings({
              id: auth0user['user_id'],
              infos: {
                isConnected: auth0user ? true : false,
                loginsCount: auth0user['logins_count'],
                lastLogin: auth0user['last_login'],
              },
            });

            const newUser = new User({ ...user, auth0Settings });
            store.dispatch(setUser({ user: newUser }));
            return store.select(FromRoot.selectCompanies);
          }),
          map(({ data: companiesById }) => {
            return {
              user: (companiesById.get(activatedRoute.params['id']) as Company).usersById.get(
                activatedRoute.params['userId'],
              ) as User,
              applications: applications.sort(Application.Cmp),
            };
          }),
        );
      }

      return of({ user: user, applications: applications });
    }),
    tap(({ user }) => {
      store.dispatch(
        addBreadcrumbItem({
          breadcrumbItem: {
            name: user.fullname,
            url: `${AltoRoutes.companies}/${user.companyId}/${AltoRoutes.user}/${user.id}`,
            icon: EmojiName.OfficeWorker,
          },
        }),
      );
    }),
  );
};
