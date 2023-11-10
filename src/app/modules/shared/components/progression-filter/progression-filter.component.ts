import { Component, EventEmitter, Input, Output } from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';

@Component({
  selector: 'alto-progression-filter',
  templateUrl: './progression-filter.component.html',
  styleUrls: ['./progression-filter.component.scss'],
})
export class ProgressionFilterComponent {
  I18ns = I18ns;

  progressionFilters = [{ name: 'c' }]

  @Input() selectedItems: any[] = [];
  @Input() disabled: boolean | any;
  @Output() selectChange = new EventEmitter<string>();
}
