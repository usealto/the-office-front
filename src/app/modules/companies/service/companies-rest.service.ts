import { Injectable } from '@angular/core';
import {
  CompanyDtoApi,
  CreateCompanyRequestParams,
  GetCompaniesRequestParams,
  PatchCompanyRequestParams,
  CompaniesApiService as TheofficeCompanyApiService,
} from '@usealto/the-office-sdk-angular';
import { Observable, map } from 'rxjs';
import { Company } from '../../../core/models/company.model';

@Injectable({
  providedIn: 'root',
})
export class CompaniesRestService {
  constructor(private readonly theofficeCompanyApi: TheofficeCompanyApiService) {}

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

    return this.theofficeCompanyApi.getCompanies(req).pipe(
      map(({ data, meta }) => ({
        companies: data ? data.map(Company.fromDto) : [],
        itemCount: meta.totalItems,
        pageCount: meta.totalPage,
      })),
    );
  }

  createCompany(name: string): Observable<Company> {
    const req: CreateCompanyRequestParams = {
      createCompanyDtoApi: { name },
    };

    return this.theofficeCompanyApi
      .createCompany(req)
      .pipe(map(({ data }) => Company.fromDto(data as CompanyDtoApi)));
  }

  updateCompany(companyId: string, name: string): Observable<Company> {
    const req: PatchCompanyRequestParams = {
      id: companyId,
      patchCompanyDtoApi: { name },
    };
    return this.theofficeCompanyApi
      .patchCompany(req)
      .pipe(map(({ data }) => Company.fromDto(data as CompanyDtoApi)));
  }
}
