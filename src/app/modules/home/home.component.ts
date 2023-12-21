import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { Subscription, combineLatest, debounce, of, startWith, switchMap, timer } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Company } from '../../core/models/company.model';
import { User } from '../../core/models/user.model';
import { IAppData } from '../../core/resolvers/app.resolver';
import { EResolverData, ResolversService } from '../../core/resolvers/resolvers.service';
import { EmojiName } from '../../core/utils/emoji/data';
import { CompaniesRestService } from '../companies/service/companies-rest.service';
import { EPlaceholderStatus } from '../shared/models/placeholder.model';
import { CompanyFormComponent } from './company-form/company-form.component';

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
  Emoji = EmojiName;
  environment = environment;

  me!: User;
  filteredCompanies: ICompanyInfos[] = [];

  readonly companiesPageSize = 5;
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
        )
        .subscribe(({ companies, itemCount, pageCount }) => {
          this.filteredCompanies = companies.map((company) => ({
            company,
            trainxAvailableLicenses: this.getCompanyTrainxAvailableLicenses(company),
            recordxAvailableLicenses: this.getCompanyRecordxAvailableLicenses(company),
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

  getCompanyTrainxAvailableLicenses(company: Company): number {
    const companyTrainxUsersWithLicense = company.users.filter(
      (u) => u.hasTrainxAccess() && u.hasTrainxLicense(),
    );
    return company.trainxSettings.licenseCount - companyTrainxUsersWithLicense.length;
  }

  getCompanyRecordxAvailableLicenses(company: Company): number {
    const companyRecordxUsers = company.users.filter((u) => u.hasRecordxAccess() && u.hasRecordxLicense());
    return company.recordxSettings.licenseCount - companyRecordxUsers.length;
  }

  resetSearch(): void {
    this.searchTerm.setValue(null);
  }

  openCompanyEditForm(company: Company): void {
    const canvaRef = this.offcanvasService.open(CompanyFormComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
    });
    canvaRef.componentInstance.company = company;
  }
}
