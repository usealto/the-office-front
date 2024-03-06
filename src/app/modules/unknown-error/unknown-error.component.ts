import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { I18ns } from '../../core/utils/i18n/I18n';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'alto-unknown-error',
  templateUrl: './unknown-error.component.html',
  styleUrls: ['./unknown-error.component.scss'],
})
export class UnknownErrorComponent implements OnInit {
  constructor(
    public route: ActivatedRoute,
    public auth: AuthService) {}
  errorMessage: string = '';
  I18ns = I18ns

  ngOnInit() {
    this.errorMessage = this.route.snapshot.paramMap.get('error') || '';
  }

  logOut() {
    console.log('heere');
    
    this.auth.logout({ logoutParams: { returnTo: window.location.origin } });
    return;
  }
}
