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
import { CompaniesRestService } from '../companies/service/companies-rest.service';
import { UsersRestService } from '../profile/services/users-rest.service';
import { EPlaceholderStatus } from '../shared/models/placeholder.model';
import { CompanyFormComponent } from './company-form/company-form.component';
import { addCompanies } from '../../core/store/root/root.action';
import { AltoRoutes } from '../shared/constants/routes';

interface ICompanyInfos {
  company: Company;
  trainxAvailableLicenses: number;
  recordxAvailableLicenses: number;
}

@Component({
  selector: 'alto-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  readonly Emoji = EmojiName;
  readonly environment = environment;
  readonly AltoRoutes = AltoRoutes;

  me!: User;
  filteredCompanies: ICompanyInfos[] = [];

  readonly companiesPageSize = 10;
  pageControl = new FormControl(1, { nonNullable: true });
  pageCount = 1;
  companiesCount = 0;

  companiesDataStatus = EPlaceholderStatus.Good;

  searchTerm: FormControl<string | null> = new FormControl(null);
  homeSubscription = new Subscription();

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolverService: ResolversService,
    private readonly offcanvasService: NgbOffcanvas,
    private readonly companiesRestService: CompaniesRestService,
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
            return this.companiesRestService.getPaginatedCompanies(
              page,
              this.companiesPageSize,
              searchTerm ? searchTerm : undefined,
            );
          }),
          switchMap((paginatedCompanies) => {
            return combineLatest([
              of(paginatedCompanies),
              ...paginatedCompanies.companies.map((company) => {
                return this.usersRestService.getUsersByCompanyId(company.id);
              }),
            ]);
          }),
          map(([paginatedCompanies, ...users]) => {
            paginatedCompanies.companies.forEach((company, index) => {
              company.users = users[index];
            });

            paginatedCompanies.companies = paginatedCompanies.companies.map((company, index) => {
              const updatedCompany = new Company({
                ...company,
                users: users[index].map((user) => user.rawData),
              });
              return updatedCompany;
            });

            return paginatedCompanies;
          }),
          tap(({ companies }) => {
            this.store.dispatch(addCompanies({ companies }));
          }),
        )
        .subscribe(({ companies, itemCount, pageCount }) => {
          this.filteredCompanies = companies.map((company) => ({
            company,
            trainxAvailableLicenses: company.trainxAvailableLicenses,
            recordxAvailableLicenses: company.recordxAvailableLicenses,
          }));
          this.companiesCount = itemCount;
          this.pageCount = pageCount;
          this.companiesDataStatus = this.filteredCompanies.length
            ? EPlaceholderStatus.Good
            : EPlaceholderStatus.NoResult;
        }),
    );
  }

  ngOnDestroy(): void {
    this.homeSubscription.unsubscribe();
  }

  resetSearch(): void {
    this.searchTerm.setValue(null);
  }

  openCompanyEditForm(company?: Company): void {
    const canvaRef = this.offcanvasService.open(CompanyFormComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
    });
    canvaRef.componentInstance.company = company;

    canvaRef.closed.subscribe(() => {
      this.pageControl.patchValue(this.pageControl.value);
    });
  }
}
