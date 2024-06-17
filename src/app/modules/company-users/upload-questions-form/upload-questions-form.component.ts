import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbActiveOffcanvas, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';

import { Company } from '../../../core/models/company.model';

import { ValidatorsService } from '../../shared/services/validators.service';
import { UploadRestService } from '../../shared/services/upload-rest.service';
import { User } from 'src/app/core/models/user.model';

@Component({
  selector: 'alto-upload-questions-form',
  templateUrl: './upload-questions-form.component.html',
  styleUrls: ['./upload-questions-form.component.scss'],
})
export class UploadQuestionsFormComponent {
  @Input() company!: Company;
  @Input() leads!: User[];
  @Input() coachs?: ;

  uploadQuestionsFormGroup = new FormGroup({});
  userFormSubscription = new Subscription();

  constructor(
    private readonly uploadRestService: UploadRestService,
    private readonly validatorsService: ValidatorsService,
    private readonly activeOffcanvas: NgbActiveOffcanvas,
  ) {}

  submit(): void {
    this.uploadRestService.uploadQuestion('id', this.company.id, this.coachId).subscribe({
      next: () => {
        this.activeOffcanvas.close();
      },
    });
  }
}
