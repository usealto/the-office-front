import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IAppData } from './app.resolver';
import { ICompanyUsersData } from './companyUsers.resolver';
import { IUserData } from './user.resolver';

export enum EResolverData {
  AppData = 'appData',
  CompanyUsersData = 'companyUsersData',
  UserData = 'userData',
}

export type ResolverData = {
  [key: string]: IAppData | ICompanyUsersData | IUserData;
};

@Injectable()
export class ResolversService {
  getDataFromPathFromRoot(routes: ActivatedRoute[]): ResolverData {
    return routes.reduce((data, route) => {
      return { ...data, ...route.snapshot.data };
    }, {});
  }
}
