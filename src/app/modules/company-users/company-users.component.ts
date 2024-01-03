import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { Subscription, combineLatest, debounce, map, of, startWith, switchMap, tap, timer } from 'rxjs';

import { EmojiName } from 'src/app/core/utils/emoji/data';
import { Company } from '../../core/models/company.model';
import { User } from '../../core/models/user.model';
import { ICompanyUsersData } from '../../core/resolvers/companyUsers.resolver';
import { EResolverData, ResolversService } from '../../core/resolvers/resolvers.service';
import * as FromRoot from '../../core/store/store.reducer';
import { AltoRoutes } from '../shared/constants/routes';
import { EPlaceholderStatus } from '../shared/models/placeholder.model';
import { UserFormComponent } from './user-form/user-form.component';
import { setUser, updateUserRoles } from '../../core/store/root/root.action';
import { ToastService } from '../../core/toast/toast.service';

@Component({
  selector: 'alto-company-users',
  templateUrl: './company-users.component.html',
  styleUrls: ['./company-users.component.scss'],
})
export class CompanyUsersComponent implements OnInit, OnDestroy {
  readonly Emoji = EmojiName;
  readonly AltoRoutes = AltoRoutes;
  readonly User = User;

  company!: Company;
  filteredUsers: User[] = [];
  usersDataStatus = EPlaceholderStatus.Good;

  pageControl = new FormControl(1, { nonNullable: true });
  pageCount = 1;
  usersCount = 0;
  readonly usersPageSize = 10;

  searchTerm: FormControl<string | null> = new FormControl(null);
  private readonly companyUsersSubscription = new Subscription();

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolverService: ResolversService,
    private readonly offcanvasService: NgbOffcanvas,
    private readonly store: Store<FromRoot.AppState>,
    private readonly toastService: ToastService,
  ) {}

  ngOnInit(): void {
    const data = this.resolverService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    this.company = (data[EResolverData.CompanyUsersData] as ICompanyUsersData).company;

    this.companyUsersSubscription.add(
      combineLatest([
        this.pageControl.valueChanges.pipe(startWith(1)),
        this.searchTerm.valueChanges.pipe(
          startWith(null),
          debounce((searchTerm) => (searchTerm ? timer(500) : of(null))),
          tap(() => this.pageControl.setValue(1)),
        ),
      ]).subscribe(([page, searchTerm]) => {
        const allFilteredUsers = this.company.users.filter((user) => {
          return !searchTerm || user.fullname.toLowerCase().includes(searchTerm.toLowerCase());
        });
        this.pageCount = Math.ceil(allFilteredUsers.length / this.usersPageSize);
        this.filteredUsers = allFilteredUsers.slice(
          (page - 1) * this.usersPageSize,
          page * this.usersPageSize,
        );
        this.usersCount = this.filteredUsers.length;
        this.usersDataStatus =
          this.filteredUsers.length > 0 ? EPlaceholderStatus.Good : EPlaceholderStatus.NoResult;
      }),
    );
  }

  ngOnDestroy(): void {
    this.companyUsersSubscription.unsubscribe();
  }

  resetSearch(): void {
    this.searchTerm.setValue(null);
  }

  openUserForm(user?: User): void {
    const canvaRef = this.offcanvasService.open(UserFormComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
    });

    const instance = canvaRef.componentInstance as UserFormComponent;
    instance.user = user;
    instance.company = this.company;

    const subscription = canvaRef.closed
      .pipe(
        switchMap((user) => {
          if (user) {
            this.store.dispatch(updateUserRoles({ userId: user.id, roles: user.roles }));
          } else {
            this.store.dispatch(setUser({ user }));
          }

          return this.store.select(FromRoot.selectCompanies);
        }),
        tap(({ data: companiesById }) => {
          this.company = companiesById.get(this.company.id) as Company;
          this.pageControl.patchValue(this.pageControl.value);
        }),
      )
      .subscribe({
        next: () => {
          this.toastService.show({
            text: user ? 'User successfully updated' : 'User successfully created',
            type: 'success',
          });
          subscription.unsubscribe();
        },
      });
  }
}
