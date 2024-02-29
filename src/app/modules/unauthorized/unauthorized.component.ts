
import { Component } from '@angular/core';
import { I18ns } from '../../core/utils/i18n/I18n';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'alto-unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.scss']
})
export class UnauthorizedComponent {
  I18ns = I18ns;

  constructor(public auth: AuthService) {}

  logOut() {
    this.auth.logout({ logoutParams: { returnTo: window.location.origin } });
    return;
  }
}
