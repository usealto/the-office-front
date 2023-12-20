import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Company } from '../../core/models/company.model';
import { User } from '../../core/models/user.model';
import { IAppData } from '../../core/resolvers/app.resolver';
import { EResolverData, ResolversService } from '../../core/resolvers/resolvers.service';
import { EmojiName } from '../../core/utils/emoji/data';
import { EPlaceholderStatus } from '../shared/models/placeholder.model';
import { UserDtoApiRolesEnumApi } from '@usealto/the-office-sdk-angular';
import { environment } from '../../../environments/environment';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { EditCompanyComponent } from './edit-company/edit-company.component';

interface ICompanyDisplay {
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
  companiesById = new Map<string, Company>();
  filteredCompanies: ICompanyDisplay[] = [];
  filteredCompaniesDisplay: ICompanyDisplay[] = [];
  companiesPage = 1;
  companiesPageSize = 3;
  companiesDataStatus = EPlaceholderStatus.Good;

  searchTerm: FormControl<string | null> = new FormControl(null);
  homeSubscription = new Subscription();

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolverService: ResolversService,
    private readonly offcanvasService: NgbOffcanvas,
  ) {}

  ngOnInit(): void {
    const data = this.resolverService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    this.companiesById = (data[EResolverData.AppData] as IAppData).companiesById;
    this.me = (data[EResolverData.AppData] as IAppData).me;
    const companies = Array.from(this.companiesById.values());
    this.filteredCompanies = companies.map((company) => ({
      company,
      trainxAvailableLicenses: this.getCompanyTrainxAvailableLicenses(company),
      recordxAvailableLicenses: this.getCompanyRecordxAvailableLicenses(company),
    }));
    this.changeCompaniesPage(1);

    this.companiesDataStatus = this.companiesById.size ? EPlaceholderStatus.Good : EPlaceholderStatus.NoData;

    this.homeSubscription.add(
      this.searchTerm.valueChanges.subscribe((searchTerm) => {
        this.filteredCompanies = Array.from(this.companiesById.values())
          .filter((company) => {
            if (!searchTerm) return true;
            return company.name.toLowerCase().includes(searchTerm.toLowerCase());
          })
          .map((company) => ({
            company,
            trainxAvailableLicenses: this.getCompanyTrainxAvailableLicenses(company),
            recordxAvailableLicenses: this.getCompanyRecordxAvailableLicenses(company),
          }));
        this.changeCompaniesPage(1);
        this.companiesDataStatus = this.filteredCompanies.length
          ? EPlaceholderStatus.Good
          : EPlaceholderStatus.NoResult;
      }),
    );
  }

  changeCompaniesPage(page: number): void {
    this.companiesPage = page;
    this.filteredCompaniesDisplay = this.filteredCompanies.slice(
      (this.companiesPage - 1) * this.companiesPageSize,
      this.companiesPage * this.companiesPageSize,
    );
  }

  getCompanyTrainxAvailableLicenses(company: Company): number {
    const companyTrainxUsers = company.users.filter((u) =>
      u.roles.includes(UserDtoApiRolesEnumApi.TrainxUser),
    );
    return company.trainxSettings.licenseCount - companyTrainxUsers.length;
  }

  getCompanyRecordxAvailableLicenses(company: Company): number {
    const companyRecordxUsers = company.users.filter((u) =>
      u.roles.includes(UserDtoApiRolesEnumApi.RecordxUser),
    );
    return company.recordxSettings.licenseCount - companyRecordxUsers.length;
  }

  ngOnDestroy(): void {
    this.homeSubscription.unsubscribe();
  }

  resetSearch(): void {
    this.searchTerm.setValue(null);
  }

  openCompanyEditForm(company: Company): void {
    const canvaRef = this.offcanvasService.open(EditCompanyComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
    });
    canvaRef.componentInstance.company = company;
  }
}
