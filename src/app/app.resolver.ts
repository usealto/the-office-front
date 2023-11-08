import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { combineLatest, take } from 'rxjs';
import { EmojiMap, emojiData } from './core/utils/emoji/data';
import { UsersRestService } from './modules/profile/services/users-rest.service';

export const appResolver: ResolveFn<any> = () => {
  emojiData.forEach((d) => EmojiMap.set(d.id, d));

  return combineLatest([
    inject(UsersRestService).getMe(),
  ]).pipe(take(1));
};

export const noSplashScreenResolver: ResolveFn<any> = () => {
  document.getElementsByClassName('first-loader').item(0)?.remove();
};
