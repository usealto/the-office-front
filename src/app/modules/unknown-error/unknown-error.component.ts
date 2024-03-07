import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { I18ns } from '../../core/utils/i18n/I18n';

@Component({
  selector: 'alto-unknown-error',
  templateUrl: './unknown-error.component.html',
  styleUrls: ['./unknown-error.component.scss'],
})
export class UnknownErrorComponent implements OnInit {
  constructor(private readonly route: ActivatedRoute, private readonly auth: AuthService) {}
  errorMessage: string = '';
  I18ns = I18ns;

  ngOnInit(): void {
    this.errorMessage = this.route.snapshot.paramMap.get('error') || '';
  }

  logOut(): void {
    this.auth.logout({ logoutParams: { returnTo: window.location.origin } });
    return;
  }
}
