import { Component, Input } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'alto-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent {
  AltoRoutes = AltoRoutes;
  I18ns = I18ns;

  @Input() me!: User;

  constructor(public auth: AuthService) {}

  logOut() {
    this.auth.logout({ logoutParams: { returnTo: window.location.origin } });
    return;
  }
}
