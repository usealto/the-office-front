import { Injectable } from '@angular/core';
import { UploadsApiService as TrainxUploadApiService } from '@usealto/sdk-ts-angular';

import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UploadRestService {
  constructor(private readonly trainxUploadApi: TrainxUploadApiService) {}

  uploadQuestion(leadId: string, companyId: string, coachId?: string): Observable<void> {
    return this.trainxUploadApi
      .uploadsControllerUploadQuestions({
        file: new Blob(),
        companyId2: companyId,
        userId2: leadId,
      })
      .pipe(tap((res) => console.log(res)));
  }
}
