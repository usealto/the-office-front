import { Component } from '@angular/core';
import { I18ns } from '../../core/utils/i18n/I18n';

@Component({
  selector: 'alto-unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.scss']
})
export class UnauthorizedComponent {
  I18ns = I18ns;
}
