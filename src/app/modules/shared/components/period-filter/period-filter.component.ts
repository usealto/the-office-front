import { Component, EventEmitter, Output } from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';;

@Component({
  selector: 'alto-period-filter',
  templateUrl: './period-filter.component.html',
  styleUrls: ['./period-filter.component.scss'],
})
export class PeriodFilterComponent {
  I18ns = I18ns;
  @Output() selectChange = new EventEmitter<any>();
  data = [
  ];
  selectedItem?: any;
}
