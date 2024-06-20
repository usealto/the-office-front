import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { Subscription, combineLatest, debounce, map, of, startWith, switchMap, tap, timer } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Company } from '../../core/models/company.model';
import { User } from '../../core/models/user.model';
import { IAppData } from '../../core/resolvers/app.resolver';
import { EResolverData, ResolversService } from '../../core/resolvers/resolvers.service';
import * as FromRoot from '../../core/store/store.reducer';
import { EmojiName } from '../../core/utils/emoji/data';
import { UsersRestService } from '../profile/services/users-rest.service';
import { EPlaceholderStatus } from '../shared/models/placeholder.model';
import { addCoachs, addCompanies } from '../../core/store/root/root.action';
import { AltoRoutes } from '../shared/constants/routes';
import { CoachDtoApi } from '@usealto/sdk-ts-angular';
import { CoachsRestService } from './services/coachs-rest.service';
import { CoachFormComponent } from './coach-form/coach-form.component';

@Component({
  selector: 'alto-coachs',
  templateUrl: './coachs.component.html',
  styleUrls: ['./coachs.component.scss'],
})
export class CoachsComponent implements OnInit, OnDestroy {
  readonly Emoji = EmojiName;
  readonly environment = environment;
  readonly AltoRoutes = AltoRoutes;

  me!: User;
  filteredCoachs: CoachDtoApi[] = [];

  readonly coachsPageSize = 10;
  pageControl = new FormControl(1, { nonNullable: true });
  pageCount = 1;
  coachsCount = 0;

  coachsDataStatus = EPlaceholderStatus.Good;

  searchTerm: FormControl<string | null> = new FormControl(null);
  homeSubscription = new Subscription();

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolverService: ResolversService,
    private readonly offcanvasService: NgbOffcanvas,
    private readonly coachsRestService: CoachsRestService,
    private readonly usersRestService: UsersRestService,
    private readonly store: Store<FromRoot.AppState>,
  ) {}

  ngOnInit(): void {
    const data = this.resolverService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    this.me = (data[EResolverData.AppData] as IAppData).me;

    this.homeSubscription.add(
      combineLatest([
        this.pageControl.valueChanges.pipe(startWith(1)),
        this.searchTerm.valueChanges.pipe(
          startWith(null),
          debounce((searchTerm) => (searchTerm ? timer(500) : of(null))),
          tap(() => this.pageControl.patchValue(1)),
        ),
      ])
        .pipe(
          switchMap(([page, searchTerm]) => {
            return this.coachsRestService.getPaginatedCoachs(
              page,
              this.coachsPageSize,
              searchTerm ? searchTerm : undefined,
            );
          }),
          tap(({ coachs }) => {
            this.store.dispatch(addCoachs({ coachs }));
          }),
        )
        .subscribe(({ coachs, itemCount, pageCount }) => {
          this.filteredCoachs = coachs;
          this.coachsCount = itemCount;
          this.pageCount = pageCount;
          this.coachsDataStatus = this.filteredCoachs.length
            ? EPlaceholderStatus.Good
            : EPlaceholderStatus.NoResult;
        }),
    );
  }

  ngOnDestroy(): void {
    console.log('CoachsComponent destroyed');
  }

  resetSearch(): void {
    this.searchTerm.setValue(null);
  }

  openCoachEditForm(coach?: CoachDtoApi): void {
    const canvaRef = this.offcanvasService.open(CoachFormComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
    });
    canvaRef.componentInstance.coach = coach;

    canvaRef.closed.subscribe(() => {
      this.pageControl.patchValue(this.pageControl.value);
    });
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Copied to clipboard');
    });
  }
}
