import { Injectable } from '@angular/core';

import { Observable, map } from 'rxjs';
import {
  CoachDtoApi,
  CoachsApiService,
  CreateCoachRequestParams,
  GetCoachsRequestParams,
  PatchCoachRequestParams,
} from '@usealto/sdk-ts-angular';

@Injectable({
  providedIn: 'root',
})
export class CoachsRestService {
  constructor(private readonly coachsApi: CoachsApiService) {}

  getCompanyById(coachId: string): Observable<CoachDtoApi | undefined> {
    return this.coachsApi.getCoachById({ id: coachId }).pipe(map(({ data }) => data));
  }

  getPaginatedCoachs(
    page: number,
    itemsPerPage: number,
    searchTerm?: string,
  ): Observable<{ coachs: CoachDtoApi[]; itemCount: number; pageCount: number }> {
    const req: GetCoachsRequestParams = {
      page,
      sortBy: 'createdAt:desc',
      itemsPerPage,
      // search: searchTerm, // TODO Add Search Coach
    };

    return this.coachsApi.getCoachs(req).pipe(
      map(({ data, meta }) => ({
        coachs: data ? data : [],
        itemCount: meta.totalItems,
        pageCount: meta.totalPage,
      })),
    );
  }

  createCoach(name: string, pictureUrl: string): Observable<CoachDtoApi | undefined> {
    const req: CreateCoachRequestParams = {
      createCoachDtoApi: { name, pictureUrl },
    };

    return this.coachsApi.createCoach(req).pipe(map(({ data }) => data));
  }

  updateCoach(coachId: string, name: string, pictureUrl: string): Observable<CoachDtoApi | undefined> {
    const req: PatchCoachRequestParams = {
      id: coachId,
      patchCoachDtoApi: { name, pictureUrl },
    };
    return this.coachsApi.patchCoach(req).pipe(map(({ data }) => data));
  }
}
