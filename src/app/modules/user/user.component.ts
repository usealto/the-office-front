import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription, debounceTime, first, merge, of, switchMap, tap } from 'rxjs';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'src/environments/environment';
import { Company } from '../../core/models/company.model';
import { EUserRole, User } from '../../core/models/user.model';
import { ICompanyUsersData } from '../../core/resolvers/companyUsers.resolver';
import { EResolverData, ResolversService } from '../../core/resolvers/resolvers.service';
import { updateUserRoles } from '../../core/store/root/root.action';
import * as FromRoot from '../../core/store/store.reducer';
import { ToastService } from '../../core/toast/toast.service';
import { EmojiName } from '../../core/utils/emoji/data';
import { UsersRestService } from '../profile/services/users-rest.service';
import { ConfirmModalComponent } from '../shared/components/confirm-modal/confirm-modal.component';
import { PillOption } from '../shared/models/select-option.model';

@Component({
  selector: 'alto-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UserComponent implements OnInit, OnDestroy {
  private readonly roles = User.getRoleList();
  readonly Emoji = EmojiName;
  readonly environment = environment;
  readonly rolesOptions: PillOption[] = this.roles
    .filter((role) => role === EUserRole.AltoAdmin || role === EUserRole.BillingAdmin)
    .map((role) => new PillOption({ label: role, value: role, color: User.getRoleColor(role) }));

  company!: Company;
  user!: User;

  rolesCtrl = new FormControl<FormControl<PillOption>[]>([], { nonNullable: true });

  private readonly userComponentSubscription = new Subscription();

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolverService: ResolversService,
    private readonly usersRestService: UsersRestService,
    private readonly store: Store<FromRoot.AppState>,
    private readonly toastService: ToastService,
    private readonly modalService: NgbModal,
  ) {}

  ngOnInit(): void {
    const data = this.resolverService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    this.company = (data[EResolverData.CompanyUsersData] as ICompanyUsersData).company;
    this.user = (data[EResolverData.UserData] as { user: User }).user;

    this.rolesCtrl = new FormControl(
      this.user.roles.map(
        (role) =>
          new FormControl<PillOption>(
            {
              value: new PillOption({ value: role, label: role, color: User.getRoleColor(role) }),
              disabled: role !== EUserRole.AltoAdmin && role !== EUserRole.BillingAdmin,
            },
            { nonNullable: true },
          ),
      ),
      { nonNullable: true },
    );

    this.userComponentSubscription.add(
      this.rolesCtrl.valueChanges
        .pipe(
          debounceTime(500),
          switchMap(() => {
            if (this.rolesCtrl.value.some((control) => control.value.value === EUserRole.BillingAdmin)) {
              const companyBillingAdmin = this.company.billingAdmin;

              if (companyBillingAdmin && companyBillingAdmin.id !== this.user.id) {
                const modalRef = this.modalService.open(ConfirmModalComponent, {
                  centered: true,
                  size: 'md',
                });

                modalRef.componentInstance.data = {
                  title: 'Confirm role change',
                  subtitle: `Adding billing admin role to ${this.user.fullname} will remove billing admin role from ${companyBillingAdmin.fullname}`,
                };

                return merge(modalRef.closed, modalRef.dismissed).pipe(
                  tap((confirmed) => {
                    if (!confirmed) {
                      const billingAdminIndex = this.rolesCtrl.value.findIndex(
                        (control) => control.value.value === EUserRole.BillingAdmin,
                      );

                      this.rolesCtrl.patchValue(
                        this.rolesCtrl.value.filter((_, index) => index !== billingAdminIndex),
                      );
                    }
                  }),
                );
              }
            }
            return of(true);
          }),
          switchMap((confirmed) => {
            if (
              confirmed &&
              (this.rolesCtrl.value.length !== this.user.roles.length ||
                this.rolesCtrl.value.some(
                  (control) => !this.user.roles.includes(control.value.value as EUserRole),
                ))
            ) {
              return this.usersRestService
                .updateUser(
                  this.user.id,
                  User.mapRoles(this.rolesCtrl.value.map((control) => control.value.value)),
                )
                .pipe(
                  switchMap((user) => {
                    this.store.dispatch(updateUserRoles({ userId: user.id, roles: user.roles }));
                    return this.store.select(FromRoot.selectCompanies);
                  }),
                  first(),
                  tap(({ data: companies }) => {
                    const company = companies.get(this.company.id) as Company;
                    this.user = company.usersById.get(this.user.id) as User;
                  }),
                );
            }
            return of(null);
          }),
        )
        .subscribe({
          next: () => {
            this.toastService.show({
              text: 'User roles updated',
              type: 'success',
            });
          },
          error: () => {
            this.toastService.show({
              text: 'Something went wrong updating user roles',
              type: 'danger',
            });
          },
        }),
    );
  }

  ngOnDestroy(): void {
    this.userComponentSubscription.unsubscribe();
  }

  sendResetPassword(userEmail: string): void {
    this.usersRestService.auth0ResetPassword(userEmail).subscribe({
      complete: () => {
        this.toastService.show({
          text: `An email will be sent to ${userEmail}`,
          type: 'success',
        });
      },
      error: () => {
        this.toastService.show({
          text: 'Error occured during sending password reset email',
          type: 'danger',
        });
      },
    });
  }
}
