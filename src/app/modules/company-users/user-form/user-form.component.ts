import { Component, Input, OnInit } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { UserDtoApiRolesEnumApi } from '@usealto/the-office-sdk-angular';
import { UsersRestService } from '../../profile/services/users-rest.service';
import { User } from '../../../core/models/user.model';
import { Observable, map, of } from 'rxjs';
import { ValidatorsService } from '../../shared/services/validators.service';

@Component({
  selector: 'alto-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
})
export class UserFormComponent implements OnInit {
  @Input() user?: User;
  @Input() companyId!: string;

  roles = Object.values(UserDtoApiRolesEnumApi);

  userFormGroup = new FormGroup({
    firstname: new FormControl(null, {
      validators: [this.validatorsService.requiredValidator('Firstname is mandatory')],
    }),
    lastname: new FormControl(null, {
      validators: [this.validatorsService.requiredValidator('Lastname is mandatory')],
    }),
    email: new FormControl(null, {
      asyncValidators: [this.emailValidator()],
    }),
    roles: new FormControl(Array<UserDtoApiRolesEnumApi>, {
      validators: [this.validatorsService.minLengthValidator(1, 'At least one role is required')],
    }),
  });

  constructor(
    private readonly usersRestService: UsersRestService,
    private readonly validatorsService: ValidatorsService,
  ) {}

  ngOnInit(): void {}

  private emailValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (Validators.required(control)) {
        return of({ error: 'Email is mandatory' });
      }
      return this.usersRestService
        .getUsersCountByEmails(control.value)
        .pipe(map((count) => (count > 0 ? { error: 'Email already exists' } : null)));
    };
  }

  submit(): void {}
}
