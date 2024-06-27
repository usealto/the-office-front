import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbActiveOffcanvas, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';

import { Company } from '../../../core/models/company.model';

import { ValidatorsService } from '../../shared/services/validators.service';
import { UploadRestService } from '../../shared/services/upload-rest.service';
import { User } from 'src/app/core/models/user.model';
import { CoachDtoApi } from '@usealto/sdk-ts-angular';

@Component({
  selector: 'alto-upload-questions-form',
  templateUrl: './upload-questions-form.component.html',
  styleUrls: ['./upload-questions-form.component.scss'],
})
export class UploadQuestionsFormComponent implements OnInit {
  @Input() company!: Company;
  @Input() leads!: User[];
  @Input() coachs?: CoachDtoApi[];

  uploadQuestionsFormGroup = new FormGroup({
    leadCtrl: new FormControl<String | null>(null, {
      nonNullable: true,
      validators: [this.validatorsService.requiredValidator('Lead is mandatory')],
    }),
    questionsCtrl: new FormControl<File | null>(null, {
      nonNullable: true,
      validators: [this.validatorsService.requiredValidator('File is mandatory')],
    }),
    coachCtrl: new FormControl<String | null>(null, {}),
  });

  userFormSubscription = new Subscription();

  get leadCtrl(): FormControl<User | null> {
    return this.uploadQuestionsFormGroup.controls.leadCtrl as FormControl<User | null>;
  }

  get fileCtrl(): FormControl<File | null> {
    return this.uploadQuestionsFormGroup.controls.questionsCtrl as FormControl<File | null>;
  }

  get coachCtrl(): FormControl<String | null> {
    return this.uploadQuestionsFormGroup.controls.coachCtrl as FormControl<String | null>;
  }

  constructor(
    private readonly uploadRestService: UploadRestService,
    private readonly validatorsService: ValidatorsService,
    private readonly activeOffcanvas: NgbActiveOffcanvas,
  ) {}

  ngOnInit(): void {
    if (this.leads) {
      this.leadCtrl.setValue(this.leads[0]);
    }
  }

  submit(): void {
    const selectedLeadId = this.uploadQuestionsFormGroup.value.leadCtrl;
    const selectedCoachId = this.uploadQuestionsFormGroup.value.coachCtrl;
    const questions = this.uploadQuestionsFormGroup.value.questionsCtrl as File;

    this.uploadRestService
      .uploadQuestion(selectedLeadId!.toString(), this.company.id, questions, selectedCoachId?.toString())
      .subscribe({
        next: () => {
          this.activeOffcanvas.close();
        },
      });

    // this.uploadRestService.uploadQuestion('id', this.company.id, new Blob(), 'coachId').subscribe({
    //   next: () => {
    //     this.activeOffcanvas.close();
    //   },
    // });
  }
}
