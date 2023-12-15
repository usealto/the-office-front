import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IAppData } from './app.resolver';

export enum EResolverData {
  AppData = 'appData',
}

export type ResolverData = {
  [key: string]: IAppData;
};

@Injectable()
export class ResolversService {
  getDataFromPathFromRoot(routes: ActivatedRoute[]): ResolverData {
    return routes.reduce((data, route) => {
      return { ...data, ...route.snapshot.data };
    }, {});
  }
}
