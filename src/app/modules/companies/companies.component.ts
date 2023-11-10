
import { Component, OnInit } from '@angular/core';
import { tap } from 'rxjs';
import { CompaniesApiService, CompanyDtoApi } from '@usealto/the-office-sdk-angular';


@Component({
  selector: 'alto-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss']
})
export class CompaniesComponent implements OnInit {
  companies: CompanyDtoApi[] = [];
  displayedCompanies: CompanyDtoApi[] = [];
  page = 1;
  pageSize = 12;
  pageCount = 0;
  searchString = '';

  constructor(
    private readonly companiesApiService: CompaniesApiService,
  ) {}

  ngOnInit(): void {
    this.companiesApiService
      .getCompanies({itemsPerPage: 1000 })
      .pipe(tap((companies) => (this.companies = (companies?.data) ? companies?.data : [])))
      .subscribe(() => {
        this.pageCount = Math.ceil(this.companies.length / this.pageSize);
        this.refreshCompanies();
      });
  }

  onSearch(search: string) {
    this.searchString = search;
    this.refreshCompanies();
  }

  onPaginator(page: number) {
    this.page = page;
    this.refreshCompanies();
  }

  refreshCompanies() {
    let tmpCompanies = this.companies;

    if (this.searchString !== '') {
      tmpCompanies = tmpCompanies.filter((company) => {
        const term = this.searchString.toLowerCase();
        return company.name.toLowerCase().includes(term);
      });
    }

    this.pageCount = Math.ceil(tmpCompanies.length / this.pageSize);

    this.displayedCompanies = tmpCompanies.slice(
      (this.page - 1) * this.pageSize,
      (this.page - 1) * this.pageSize + this.pageSize,
    );
  }
}
