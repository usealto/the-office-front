import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { UntilDestroy } from '@ngneat/until-destroy';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';

@UntilDestroy()
@Component({
  selector: 'alto-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent {
  AltoRoutes = AltoRoutes;
  I18ns = I18ns;
  toggleTooltip = false;

  constructor(
    public readonly userStore: ProfileStore,
    private readonly router: Router,
    public auth: AuthService,
  ) {}


  logOut() {
    this.auth.logout({ logoutParams: { returnTo: window.location.origin } });
    return;
  }
}
