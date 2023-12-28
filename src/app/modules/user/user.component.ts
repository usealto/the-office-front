import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormArray, FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subscription, debounceTime, switchMap } from 'rxjs';

import { environment } from 'src/environments/environment';
import { Company } from '../../core/models/company.model';
import { EUserRole, User } from '../../core/models/user.model';
import { ICompanyUsersData } from '../../core/resolvers/companyUsers.resolver';
import { EResolverData, ResolversService } from '../../core/resolvers/resolvers.service';
import * as FromRoot from '../../core/store/store.reducer';
import { EmojiName } from '../../core/utils/emoji/data';
import { UsersRestService } from '../profile/services/users-rest.service';
import { PillOption } from '../shared/models/select-option.model';
import { addUser } from '../../core/store/root/root.action';

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

  rolesFa = new FormArray([] as FormControl<PillOption>[]);

  private readonly userComponentSubscription = new Subscription();

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolverService: ResolversService,
    private readonly usersRestService: UsersRestService,
    private readonly store: Store<FromRoot.AppState>,
  ) {}

  ngOnInit(): void {
    const data = this.resolverService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    const dataFromResolver = data[EResolverData.CompanyUsersData] as ICompanyUsersData;
    this.company = dataFromResolver.company;
    this.user = this.company.usersById.get(this.activatedRoute.snapshot.params['userId']) as User;
    this.rolesFa = new FormArray(
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
    );

    this.userComponentSubscription.add(
      this.rolesFa.valueChanges
        .pipe(
          debounceTime(500),
          switchMap(() => {
            return this.usersRestService.updateUser(
              this.user.id,
              User.mapRoles(this.rolesFa.value.map((role) => role.value)),
            );
          }),
          switchMap(() => {
            this.store.dispatch(addUser({ user: this.user }));
            return this.store.select(FromRoot.selectCompanies);
          }),
        )
        .subscribe({
          next: ({ data: companies }) => {
            const company = companies.get(this.company.id) as Company;
            this.user = company.usersById.get(this.user.id) as User;
          },
        }),
    );
  }

  ngOnDestroy(): void {
    this.userComponentSubscription.unsubscribe();
  }
}
