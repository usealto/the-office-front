import { Injectable } from '@angular/core';

import {
  ApplicationDtoApi,
  ApplicationsApiService as TheofficeApplicationApiService,
} from '@usealto/the-office-sdk-angular';
import { Observable, map } from 'rxjs';
import { Application } from '../../../core/models/application.model';

@Injectable({
  providedIn: 'root',
})
export class ApplicationsRestService {
  constructor(private readonly theofficeApplicationApi: TheofficeApplicationApiService) {}

  getApplications(applicationIds: string[] = []): Observable<Application[]> {
    return this.theofficeApplicationApi
      .applicationsControllerGetAllPaginated({ ids: applicationIds.join(',') })
      .pipe(
        map(({ data }) => {
          return data
            ? data.map((applicationDto) => Application.fromDto(applicationDto as ApplicationDtoApi))
            : [];
        }),
      );
  }
}
