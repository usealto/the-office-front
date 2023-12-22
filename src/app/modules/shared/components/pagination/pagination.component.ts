import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

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

  paginate(page: number): void {
    if (page > 0 && page <= this.pageCount) {
      this.pageControl.patchValue(page);
    }
  }
}
