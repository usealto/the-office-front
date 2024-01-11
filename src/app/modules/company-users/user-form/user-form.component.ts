import { Component, Input, OnInit } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { NgbActiveOffcanvas, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subscription, debounceTime, first, map, merge, of, switchMap, tap } from 'rxjs';

import { Company } from '../../../core/models/company.model';
import { EUserRole, User } from '../../../core/models/user.model';
import { UsersRestService } from '../../profile/services/users-rest.service';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { PillOption } from '../../shared/models/select-option.model';
import { ValidatorsService } from '../../shared/services/validators.service';

@Component({
  selector: 'alto-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
})
export class UserFormComponent implements OnInit {
  @Input() company!: Company;
  @Input() user?: User;

  readonly roles = User.getRoleList();
  readonly rolesOptions: PillOption[] = this.roles.map(
    (role) => new PillOption({ label: role, value: role, color: User.getRoleColor(role) }),
  );
  differentBillingAdmin?: User;
  optionsToDelete: string[] = [];

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
    roles: new FormControl<FormControl<PillOption>[]>([], {
      nonNullable: true,
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

  get rolesCtrl(): FormControl<FormControl<PillOption>[]> {
    return this.userFormGroup.controls.roles;
  }

  userFormSubscription = new Subscription();

  constructor(
    private readonly usersRestService: UsersRestService,
    private readonly validatorsService: ValidatorsService,
    private readonly activeOffcanvas: NgbActiveOffcanvas,
    private readonly modalService: NgbModal,
  ) {}

  ngOnInit(): void {
    if (this.user) {
      this.userFormGroup.patchValue({
        firstname: this.user.firstname,
        lastname: this.user.lastname,
        email: this.user.email,
      });

      this.rolesCtrl.patchValue(
        this.user.roles.map(
          (role) =>
            new FormControl<PillOption>(
              new PillOption({ label: role, value: role, color: User.getRoleColor(role) }),
              { nonNullable: true },
            ),
        ),
      );

      this.userFormGroup.controls.firstname.disable();
      this.userFormGroup.controls.lastname.disable();
      this.userFormGroup.controls.email.disable();
    } else {
      this.userFormGroup.controls.email.setAsyncValidators(this.emailValidator());
      this.userFormGroup.updateValueAndValidity();
    }

    this.userFormSubscription.add(
      this.rolesCtrl.valueChanges.subscribe((roles) => {
        const companyBillingAdmin = this.company.billingAdmin;
        if (
          companyBillingAdmin &&
          (!this.user || companyBillingAdmin.id !== this.user.id) &&
          roles.some(({ value }) => value.value === EUserRole.BillingAdmin)
        ) {
          this.differentBillingAdmin = companyBillingAdmin;
        } else {
          this.differentBillingAdmin = undefined;
        }

        this.optionsToDelete =
          this.user?.roles.filter((role) => !roles.some(({ value }) => value.value === role)) ?? [];
      }),
    );
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

  private openConfirmModal(): Observable<boolean> {
    const modalRef = this.modalService.open(ConfirmModalComponent, {
      centered: true,
      size: 'md',
    });
    modalRef.componentInstance.data = {
      title: 'Confirm role change',
      subtitle: 'You are about to add the alto-admin role to this user',
      icon: 'bi-exclamation-triangle-fill',
    };

    return merge(modalRef.closed, modalRef.dismissed);
  }

  submit(): void {
    const roles = User.mapRoles(this.rolesCtrl.value.map((control) => control.value.value));

    (!this.user
      ? this.usersRestService.createUser(
          this.firstnameCtrl.value,
          this.lastnameCtrl.value,
          this.emailCtrl.value,
          roles,
          this.company.id,
        )
      : (roles.includes(EUserRole.AltoAdmin) && !this.user.roles.includes(EUserRole.AltoAdmin)
          ? this.openConfirmModal()
          : of(true)
        ).pipe(
          switchMap((confirmed) => {
            if (confirmed) {
              return this.usersRestService.updateUser(this.user!.id, roles);
            }
            return of(null);
          }),
        )
    ).subscribe({
      next: (user) => {
        if (user) {
          this.userFormGroup.reset();
          this.activeOffcanvas.close(user);
        } else {
          this.activeOffcanvas.close();
        }
      },
    });
  }
}
