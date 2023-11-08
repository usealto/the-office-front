import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { UntilDestroy } from '@ngneat/until-destroy';
import { UserDtoApiRolesEnumApi } from '@usealto/sdk-ts-angular';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';

@UntilDestroy()
@Component({
  selector: 'alto-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  AltoRoutes = AltoRoutes;
  I18ns = I18ns;
  toggleTooltip = false;

  isAdmin = false;

  constructor(
    public readonly userStore: ProfileStore,
    private readonly router: Router,
    public auth: AuthService,
  ) {}

  ngOnInit(): void {
    const { roles } = this.userStore.user.value;
    if (
      roles.some((r) => r === UserDtoApiRolesEnumApi.AltoAdmin || r === UserDtoApiRolesEnumApi.CompanyAdmin)
    ) {
      this.isAdmin = true;
    }
  }


  logOut() {
    this.auth.logout({ logoutParams: { returnTo: window.location.origin } });
    return;
  }
}
