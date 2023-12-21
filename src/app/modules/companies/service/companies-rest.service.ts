import { Injectable } from '@angular/core';
import { Observable, combineLatest, map, of, switchMap, tap } from 'rxjs';
import {
  GetCompaniesRequestParams,
  CompaniesApiService as TheofficeCompanyApiService,
  CompanyDtoApi as TheOfficeCompanyDtoApi,
} from '@usealto/the-office-sdk-angular';
import { Company } from '../../../core/models/company.model';
import { PaginatedResult } from '../../../core/models/paginated.model';

@Injectable({
  providedIn: 'root',
})
export class CompaniesRestService {
  constructor(private readonly theofficeCompanyApi: TheofficeCompanyApiService) {}

  // getCompanies(): Observable<Company[]> {
  //   return this.theofficeCompanyApi
  //     .getCompanies({ page: 1, sortBy: 'createdAt:asc', itemsPerPage: 1000 })
  //     .pipe(
  //       switchMap(({ data, meta }) => {
  //         const reqs: Observable<TheOfficeCompanyDtoApi[]>[] = [of(data ? data : [])];
  //         let totalPages = meta.totalPage ?? 1;

  //         for (let i = 2; i <= totalPages; i++) {
  //           reqs.push(
  //             this.theofficeCompanyApi
  //               .getCompanies({ page: i, sortBy: 'createdAt:asc', itemsPerPage: 1000 })
  //               .pipe(
  //                 tap(({ meta }) => {
  //                   if (meta.totalPage !== totalPages) {
  //                     totalPages = meta.totalPage;
  //                   }
  //                 }),
  //                 map(({ data }) => (data ? data : [])),
  //               ),
  //           );
  //         }
  //         return combineLatest(reqs);
  //       }),
  //       map((companiesDtos) => {
  //         return companiesDtos.flat().map((companyDto) => Company.fromDto(companyDto));
  //       }),
  //     );
  // }

  getCompaniesByPage(page: number, itemsPerPage: number): Observable<Company[]> {
    return this.theofficeCompanyApi
      .getCompanies({ page, sortBy: 'createdAt:asc', itemsPerPage })
      .pipe(map(({ data }) => (data ? data.map(Company.fromDto) : [])));
  }

  getPaginatedCompanies(
    page: number,
    itemsPerPage: number,
    searchTerm?: string,
  ): Observable<{ companies: Company[]; itemCount: number; pageCount: number }> {
    const req: GetCompaniesRequestParams = {
      page,
      sortBy: 'createdAt:asc',
      itemsPerPage,
      search: searchTerm,
    };

    return this.theofficeCompanyApi.getCompanies({ ...req }).pipe(
      map(({ data, meta }) => ({
        companies: data ? data.map(Company.fromDto) : [],
        itemCount: meta.totalItems,
        pageCount: meta.totalPage,
      })),
    );
  }
}
