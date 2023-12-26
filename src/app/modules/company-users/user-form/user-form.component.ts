import { Component, Input } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { UserDtoApiRolesEnumApi } from '@usealto/the-office-sdk-angular';
import { UsersRestService } from '../../profile/services/users-rest.service';

@Component({
  selector: 'alto-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
})
export class UserFormComponent {
  @Input() companyId!: string;
  @Input() userEmails: string[] = [];

  roles = Object.values(UserDtoApiRolesEnumApi);

  userFormGroup = new FormGroup({
    firstname: new FormControl('', { validators: [this.mandatoryTextValidator('Firstname is mandatory')] }),
    lastname: new FormControl('', { validators: [this.mandatoryTextValidator('Lastname is mandatory')] }),
    email: new FormControl('', { validators: [this.mandatoryTextValidator('Email is mandatory'), this.emailValidator()] }),
    roles: new FormControl(Array<UserDtoApiRolesEnumApi>, { validators: [this.mandatoryArrayValidator('You should select a role')] }),
  }, {validators: []});


  constructor(
    private readonly usersRestService: UsersRestService,
  ) {}

  private mandatoryTextValidator(error: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return Validators.required(control) ? { error: error } : null;
    };
  }

  private mandatoryArrayValidator(error: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return Validators.required(control) ? { error: error } : null;
    };
  }

  private emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return Validators.email(control) ? { error: 'Email is not valid' } : null;
    };
  }

  submit(): void {
  }
}
