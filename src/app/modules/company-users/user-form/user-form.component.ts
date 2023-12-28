import { Component, Input, OnInit } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormArray,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Observable, debounceTime, first, map, of, switchMap, tap } from 'rxjs';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';

import { EUserRole, User } from '../../../core/models/user.model';
import { UsersRestService } from '../../profile/services/users-rest.service';
import { PillOption } from '../../shared/models/select-option.model';
import { ValidatorsService } from '../../shared/services/validators.service';

@Component({
  selector: 'alto-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
})
export class UserFormComponent implements OnInit {
  @Input() user?: User;
  @Input() companyId!: string;

  readonly roles = User.getRoleList();
  readonly rolesOptions: PillOption[] = this.roles
    .filter((role) => role === EUserRole.AltoAdmin || role === EUserRole.BillingAdmin)
    .map((role) => new PillOption({ label: role, value: role, color: User.getRoleColor(role) }));

  userFormGroup = new FormGroup({
    firstname: new FormControl('', {
      nonNullable: true,
      validators: [this.validatorsService.requiredValidator('Firstname is mandatory')],
    }),
    lastname: new FormControl('', {
      nonNullable: true,
      validators: [this.validatorsService.requiredValidator('Lastname is mandatory')],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [this.validatorsService.requiredValidator('Email is mandatory')],
    }),
    roles: new FormArray<FormControl<PillOption>>([], {
      validators: [this.validatorsService.minLengthValidator(1, 'At least one role is required')],
    }),
  });

  get firstnameCtrl(): FormControl<string> {
    return this.userFormGroup.controls.firstname;
  }

  get lastnameCtrl(): FormControl<string> {
    return this.userFormGroup.controls.lastname;
  }

  get emailCtrl(): FormControl<string> {
    return this.userFormGroup.controls.email;
  }

  get rolesCtrl(): FormArray<FormControl<PillOption>> {
    return this.userFormGroup.controls.roles;
  }

  constructor(
    private readonly usersRestService: UsersRestService,
    private readonly validatorsService: ValidatorsService,
    private readonly activeOffcanvas: NgbActiveOffcanvas,
  ) {}

  ngOnInit(): void {
    if (this.user) {
      this.userFormGroup.patchValue({
        firstname: this.user.firstname,
        lastname: this.user.lastname,
        email: this.user.email,
      });
      this.user.roles.forEach((role) => {
        this.rolesCtrl.push(
          new FormControl(
            {
              value: new PillOption({ label: role, value: role, color: User.getRoleColor(role) }),
              disabled: role !== EUserRole.AltoAdmin && role !== EUserRole.BillingAdmin,
            },
            {
              nonNullable: true,
            },
          ),
        );
      });

      this.userFormGroup.controls.firstname.disable();
      this.userFormGroup.controls.lastname.disable();
      this.userFormGroup.controls.email.disable();
    } else {
      this.userFormGroup.controls.email.setAsyncValidators(this.emailValidator());
      this.userFormGroup.updateValueAndValidity();
    }
  }

  private emailValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return control.valueChanges.pipe(
        debounceTime(800),
        switchMap(() => {
          if (Validators.required(control)) {
            return of({ error: 'Email is required' });
          }

          if (Validators.email(control)) {
            return of({ error: 'Email is invalid' });
          }

          return this.usersRestService.getUsersCountByEmails([control.value]).pipe(
            map((count) => {
              return count > 0 ? { error: 'Email already exists' } : null;
            }),
          );
        }),
        first(),
      );
    };
  }

  submit(): void {
    const roles = User.mapRoles(this.rolesCtrl.value.map((role) => role.value));

    (this.user
      ? this.usersRestService.updateUser(this.user.id, roles)
      : this.usersRestService.createUser(
          this.firstnameCtrl.value,
          this.lastnameCtrl.value,
          this.emailCtrl.value,
          roles,
          this.companyId,
        )
    )
      .pipe(
        tap(() => {
          this.activeOffcanvas.close();
        }),
      )
      .subscribe({
        complete: () => {
          this.userFormGroup.reset();
        },
      });
  }
}
