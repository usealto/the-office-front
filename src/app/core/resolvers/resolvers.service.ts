import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IAppData } from './app.resolver';
import { ICompanyUsersData } from './companyUsers.resolver';

export enum EResolverData {
  AppData = 'appData',
  CompanyUsersData = 'companyUsersData',
}

export type ResolverData = {
  [key: string]: IAppData | ICompanyUsersData;
};

@Injectable()
export class ResolversService {
  getDataFromPathFromRoot(routes: ActivatedRoute[]): ResolverData {
    return routes.reduce((data, route) => {
      return { ...data, ...route.snapshot.data };
    }, {});
  }
}
