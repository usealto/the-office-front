import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, map, of, switchMap, tap } from 'rxjs';

import { User } from '../models/user.model';
import * as FromRoot from '../store/store.reducer';
import { EmojiMap, EmojiName, emojiData } from '../utils/emoji/data';
import { addApplications, setBreadcrumbItems } from '../store/root/root.action';
import { AltoRoutes } from '../../modules/shared/constants/routes';
import { ApplicationsRestService } from '../../modules/applications/service/applications-rest.service';

export interface IAppData {
  me: User;
}

export const appResolver: ResolveFn<IAppData> = () => {
  emojiData.forEach((d) => EmojiMap.set(d.id, d));

  const applicationsRestService = inject<ApplicationsRestService>(ApplicationsRestService);
  const store = inject<Store<FromRoot.AppState>>(Store<FromRoot.AppState>);

  return combineLatest([store.select(FromRoot.selectUserMe), store.select(FromRoot.selectApplications)]).pipe(
    switchMap(([{ data: me }, applicationsById]) => {
      if (applicationsById.needsUpdate()) {
        return applicationsRestService.getApplications().pipe(
          map((applications) => {
            store.dispatch(addApplications({ applications }));
            return me;
          }),
        );
      }
      return of(me);
    }),
    map((me) => ({
      me,
    })),
    tap(() => {
      store.dispatch(
        setBreadcrumbItems({
          breadcrumbItems: [{ name: 'Home', url: AltoRoutes.home, icon: EmojiName.House }],
        }),
      );
    }),
  );
};
