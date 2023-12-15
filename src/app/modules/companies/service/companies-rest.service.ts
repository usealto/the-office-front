import { Injectable } from '@angular/core';
import { Observable, combineLatest, map, of, switchMap, tap } from 'rxjs';
import {
  CompaniesApiService as TheofficeCompanyApiService,
  CompanyDtoApi as TheOfficeCompanyDtoApi,
} from '@usealto/the-office-sdk-angular';
import { Company } from '../../../core/models/company.model';

@Injectable({
  providedIn: 'root',
})
export class CompaniesRestService {
  constructor(private readonly theofficeCompanyApi: TheofficeCompanyApiService) {}

  getCompanies(): Observable<Company[]> {
    return this.theofficeCompanyApi
      .getCompanies({ page: 1, sortBy: 'createdAt:asc', itemsPerPage: 1000 })
      .pipe(
        switchMap(({ data, meta }) => {
          const reqs: Observable<TheOfficeCompanyDtoApi[]>[] = [of(data ? data : [])];
          let totalPages = meta.totalPage ?? 1;

          for (let i = 2; i <= totalPages; i++) {
            reqs.push(
              this.theofficeCompanyApi
                .getCompanies({ page: i, sortBy: 'createdAt:asc', itemsPerPage: 1000 })
                .pipe(
                  tap(({ meta }) => {
                    if (meta.totalPage !== totalPages) {
                      totalPages = meta.totalPage;
                    }
                  }),
                  map(({ data }) => (data ? data : [])),
                ),
            );
          }
          return combineLatest(reqs);
        }),
        map((companiesDtos) => {
          return companiesDtos.flat().map((companyDto) => Company.fromDto(companyDto));
        }),
      );
  }
}
