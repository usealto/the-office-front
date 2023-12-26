import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription, combineLatest, debounce, of, startWith, timer } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { Company } from '../../core/models/company.model';
import { User } from '../../core/models/user.model';
import { ICompanyUsersData } from '../../core/resolvers/companyUsers.resolver';
import { EResolverData, ResolversService } from '../../core/resolvers/resolvers.service';
import { EPlaceholderStatus } from '../shared/models/placeholder.model';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { UserFormComponent } from './user-form/user-form.component';

@Component({
  selector: 'alto-company-users',
  templateUrl: './company-users.component.html',
  styleUrls: ['./company-users.component.scss'],
})
export class CompanyUsersComponent implements OnInit, OnDestroy {
  readonly Emoji = EmojiName;

  company!: Company;
  filteredUsers: User[] = [];
  usersDataStatus = EPlaceholderStatus.Good;

  pageControl = new FormControl(1, { nonNullable: true });
  pageCount = 1;
  usersCount = 0;
  readonly usersPageSize = 10;

  searchTerm: FormControl<string | null> = new FormControl(null);
  companyUsersSubscription = new Subscription();

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolverService: ResolversService,
    private readonly offcanvasService: NgbOffcanvas,
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
        ),
      ]).subscribe(([page, searchTerm]) => {
        this.filteredUsers = this.company.users
          .filter((user) => {
            return !searchTerm || user.fullname.toLowerCase().includes(searchTerm.toLowerCase());
          })
          .slice((page - 1) * this.usersPageSize, page * this.usersPageSize);
        this.usersCount = this.filteredUsers.length;
        this.pageCount = Math.ceil(this.company.users.length / this.usersPageSize);
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

    canvaRef.componentInstance.user = user;

    canvaRef.closed.subscribe(() => {
    });
  }
}
