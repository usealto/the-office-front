import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, tap } from 'rxjs';

import { User } from '../models/user.model';
import * as FromRoot from '../store/store.reducer';
import { EmojiMap, EmojiName, emojiData } from '../utils/emoji/data';
import { setBreadcrumbItems } from '../store/root/root.action';
import { AltoRoutes } from '../../modules/shared/constants/routes';

export interface IAppData {
  me: User;
}

export const appResolver: ResolveFn<IAppData> = () => {
  emojiData.forEach((d) => EmojiMap.set(d.id, d));

  const store = inject<Store<FromRoot.AppState>>(Store<FromRoot.AppState>);

  return store.select(FromRoot.selectUserMe).pipe(
    map(({ data: me }) => ({
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
