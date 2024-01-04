import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription, debounceTime, map, merge, of, switchMap, tap } from 'rxjs';

import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
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
import { PillOption } from '../shared/models/select-option.model';
import { UserFormComponent } from '../company-users/user-form/user-form.component';

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
    private readonly offcanvasService: NgbOffcanvas,
  ) {}

  ngOnInit(): void {
    const data = this.resolverService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    this.company = (data[EResolverData.CompanyUsersData] as ICompanyUsersData).company;
    this.user = (data[EResolverData.UserData] as { user: User }).user;
    this.rolesCtrl = new FormControl(
      this.user.roles.map(
        (role) =>
          new FormControl<PillOption>(
            new PillOption({ value: role, label: role, color: User.getRoleColor(role) }),
            { nonNullable: true },
          ),
      ),
      { nonNullable: true },
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

  openUserForm(user: User): void {
    const canvaRef = this.offcanvasService.open(UserFormComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
    });

    const instance = canvaRef.componentInstance as UserFormComponent;
    instance.user = user;
    instance.company = this.company;

    const subscription = canvaRef.closed
      .pipe(
        switchMap((user: User) => {
          this.store.dispatch(updateUserRoles({ userId: user.id, roles: user.roles }));
          return this.store.select(FromRoot.selectCompanies);
        }),
        tap(({ data: companiesById }) => {
          const company = companiesById.get(this.company.id) as Company;
          this.user = company.usersById.get(user.id) as User;
        }),
      )
      .subscribe({
        next: () => {
          this.toastService.show({
            text: 'User successfully updated',
            type: 'success',
          });
          subscription.unsubscribe();
        },
      });
  }
}
