import { Component, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { coerceBooleanProperty } from 'src/app/modules/shared/helpers/coerce-property';

export interface IBreadCrumb {
  label: string;
  url: string | any[];
}

@Component({
  selector: 'alto-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  /**
   * Coerces a data-bound value (typically a string) to a boolean.
   * Taken from https://github.com/angular/components/blob/master/src/cdk/coercion/boolean-property.ts
   */
  coerceBooleanProperty(value: any): boolean {
    return value != null && `${value}` !== 'false';
  }
  
  @Input() title = '';
  @Input() subtitle = '';
  @Input()
  get divider(): boolean {
    return this._divider;
  }
  set divider(value: boolean) {
    this._divider = coerceBooleanProperty(value);
  }
  
  private _divider = false;
  @Input() public breadcrumbs: IBreadCrumb[] = [];

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

}
