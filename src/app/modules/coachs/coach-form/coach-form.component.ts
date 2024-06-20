import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { of, tap } from 'rxjs';

import { ToastService } from '../../../core/toast/toast.service';
import { ValidatorsService } from '../../shared/services/validators.service';
import { CoachDtoApi } from '@usealto/sdk-ts-angular';
import { CoachsRestService } from '../services/coachs-rest.service';

@Component({
  selector: 'alto-coach-form',
  templateUrl: './coach-form.component.html',
  styleUrls: ['./coach-form.component.scss'],
})
export class CoachFormComponent implements OnInit {
  @Input() coach?: CoachDtoApi;
  nameControl = new FormControl('', {
    nonNullable: true,
    validators: [this.validatorsService.requiredValidator('Name is required')],
  });

  pictureUrlControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.pattern(/^https?:\/\/\S+$/)],
  });

  constructor(
    public activeOffcanvas: NgbActiveOffcanvas,
    private readonly coachsRestService: CoachsRestService,
    private readonly toastService: ToastService,
    private readonly validatorsService: ValidatorsService,
  ) {}

  ngOnInit(): void {
    if (this.coach) {
      this.nameControl.setValue(this.coach.name);
      this.pictureUrlControl.setValue(this.coach.pictureUrl || '');
    }
  }

  submit(): void {
    (this.coach
      ? this.nameControl.value !== this.coach.name || this.pictureUrlControl.value !== this.coach.pictureUrl
        ? this.coachsRestService.updateCoach(
            this.coach.id,
            this.nameControl.value,
            this.pictureUrlControl.value,
          )
        : of(this.coach)
      : this.coachsRestService.createCoach(this.nameControl.value, this.pictureUrlControl.value)
    )
      .pipe(tap(() => this.activeOffcanvas.close()))
      .subscribe({
        complete: () => {
          this.toastService.show({
            type: 'success',
            text: this.coach ? 'Coach updated' : 'Coach created',
          });
        },
        error: () => {
          this.toastService.show({
            type: 'danger',
            text: this.coach ? 'Error while updating coach' : 'Error while creating coach',
          });
        },
      });
  }
}
