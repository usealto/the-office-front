import { Component, Input } from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'alto-img-badge',
  templateUrl: './img-badge.component.html',
  styleUrls: ['./img-badge.component.scss'],
})
export class ImgBadgeComponent {
  @Input() user?: User;
  @Input() size = 32;
  @Input() hasBorder = false;
  @Input() toggleTooltip = true;

  thumb: string | null | undefined = '';

  avatarsFolder = 'assets/avatars/';
  avatarsCount = 71;

  I18ns = I18ns;

  @memoize()
  getStyle(size: number): string {
    return `width: ${size}px; height: ${size}px;`;
  }

  @memoize()
  getUserName(user?: User) {
    if (!user) {
      return I18ns.shared.deletedUsername;
    }
    return user.fullname;
  }

  @memoize()
  getAvatar(id?: string) {
    return this.avatarsFolder + `${id ? this.extractNumber(id) : '0'}` + '.svg';
  }

  @memoize()
  extractNumber(str: string): number {
    if (str.length < 8) {
      return 0;
    }
    let output = 0;
    for (let index = 0; index < str.length; index++) {
      output += str[index].charCodeAt(0);
    }
    return output % this.avatarsCount;
  }
}
