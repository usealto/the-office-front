import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { I18ns } from 'src/app/core/utils/i18n/I18n';

@Component({
  selector: 'alto-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent {
  @Input() pageControl = new FormControl(1, { nonNullable: true });
  @Input() pageCount = 1;
  @Input() itemsCount = 0;
  @Input() itemsPerPage = 0;

  I18ns = I18ns;

  paginate(page: number): void {
    this.pageControl.patchValue(page);
  }
}
