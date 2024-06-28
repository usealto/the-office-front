import { Injectable } from '@angular/core';
import {
  UploadsApiService as TrainxUploadApiService,
  UploadsControllerUploadQuestionsRequestParams,
} from '@usealto/sdk-ts-angular';

import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UploadRestService {
  constructor(private readonly trainxUploadApi: TrainxUploadApiService) {}

  uploadQuestion(leadId: string, companyId: string, file: File, coachId?: string): Observable<any> {
    const req = {
      file,
      companyId2: companyId,
      userId2: leadId,
      coachId: coachId,
    } as UploadsControllerUploadQuestionsRequestParams;

    return this.trainxUploadApi
      .uploadsControllerUploadQuestions(req, 'body', false, {
        httpHeaderAccept: 'text/csv',
        context: undefined,
      } as any)
      .pipe(
        tap((data) => {
          console.log('File uploaded');
          return data;
        }),
      );
  }
}
