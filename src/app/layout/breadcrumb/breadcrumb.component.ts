import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import * as FromRoot from '../../core/store/store.reducer';
import { Store } from '@ngrx/store';
import { IBreadcrumbItem } from '../../modules/shared/models/breadcrumb-item.model';

@Component({
  selector: 'alto-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
})
export class BreadcrumbComponent implements OnInit {
  items: IBreadcrumbItem[] = [];

  constructor(private store: Store<FromRoot.AppState>) {}

  ngOnInit(): void {
    this.store.select(FromRoot.selectBreadcrumbItems).subscribe((items) => {
      this.items = items;
    });
  }
}
