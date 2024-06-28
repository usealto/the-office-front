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
      validators: [this.validatorsService.requiredValidator('File is mandatory')],
    }),
    coachCtrl: new FormControl<String | null>(null, {}),
  });

  userFormSubscription = new Subscription();

  get leadCtrl(): FormControl<User | null> {
    return this.uploadQuestionsFormGroup.controls.leadCtrl as FormControl<User | null>;
  }

  get questionsCtrl(): FormControl<String | null> {
    return this.uploadQuestionsFormGroup.controls.questionsCtrl as FormControl<String | null>;
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

  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let file: File | null = element.files ? element.files[0] : null;
    if (file) {
      this.questionsCtrl.setValue(file.name);
    } else {
      this.questionsCtrl.reset();
    }
  }

  downloadFile(data: string, filename: string): void {
    const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor); // Required for Firefox
    anchor.click();

    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(anchor);
    }, 0);
  }

  submit(): void {
    const selectedLeadId = this.uploadQuestionsFormGroup.value.leadCtrl;
    const selectedCoachId = this.uploadQuestionsFormGroup.value.coachCtrl;
    const questionFile = this.uploadQuestionsFormGroup.value.questionsCtrl;

    const selectedLead = this.leads.find((l) => l.id === selectedLeadId);
    console.log(selectedLead, selectedCoachId, questionFile);
    if (!selectedLead || !questionFile) {
      console.error('Form is incomplete. Lead and Questions are required.');
      return;
    }

    this.uploadRestService
      .uploadQuestion(
        selectedLead.trainxSettings.id!,
        selectedLead.trainxSettings.companyId!,
        questionFile,
        selectedCoachId?.toString(),
      )
      .subscribe({
        next: (response) => {
          this.downloadFile(response, 'response.csv');
          this.activeOffcanvas.close();
          console.log('Question uploaded and file downloaded successfully');
        },
        error: (err) => {
          console.error('Error uploading question:', err);
        },
      });
  }
}
