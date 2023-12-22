import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, take, tap } from 'rxjs';
import { IFormBuilder, IFormGroup } from 'src/app/core/form-types';
import {
  ApplicationDtoApi,
  ApplicationsApiService,
  AuthApiService,
  CompanyDtoApi,
  RoleEnumApi,
  UserDtoApi,
  UserDtoApiRolesEnumApi,
  UsersApiService,
} from '@usealto/the-office-sdk-angular';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { ToastService } from 'src/app/core/toast/toast.service';

interface UserFormView {
  firstname: string;
  lastname: string;
  email: string;
  roles: Array<RoleEnumApi>;
}

interface AuthUserMetadata {
  bubbleId: string;
  companyId: string;
  altoId: string;
}

interface AuthUserGet {
  app_metadata: string;
  created_at: string;
  email: string;
  email_verified: string;
  identities: string[];
  last_ip: string;
  last_login: string;
  logins_count: number;
  name: string;
  nickname: string;
  picture: string;
  updated_at: string;
  user_id: string;
  user_metadata: AuthUserMetadata;
  username: string;
}

@Component({
  selector: 'alto-company-user',
  templateUrl: './company-user.component.html',
  styleUrls: ['./company-user.component.scss'],
})
export class CompanyUserComponent implements OnInit {
  companyId!: string;
  userForm!: IFormGroup<UserFormView>;
  private fb: IFormBuilder;
  rolesPossibleValues = Object.values(UserDtoApiRolesEnumApi);
  userId!: string;
  userAuth0!: AuthUserGet;
  user!: UserDtoApi;
  company!: CompanyDtoApi;
  btnClicked = false;
  hasTrainX = false;
  applicationList: ApplicationDtoApi[] = [];

  constructor(
    private route: ActivatedRoute,
    readonly fob: UntypedFormBuilder,
    private readonly authApiService: AuthApiService,
    private readonly companiesRestService: CompaniesRestService,
    private readonly usersApiService: UsersApiService,
    private readonly toastService: ToastService,
    private readonly applicationsApiService: ApplicationsApiService,
  ) {
    this.fb = fob;
  }

  async ngOnInit(): Promise<void> {
    this.companyId = this.route.snapshot.paramMap.get('companyId') || '';
    this.userId = this.route.snapshot.paramMap.get('userId') || '';

    // combineLatest({
    //   company: this.companiesRestService.getCompanyById(this.companyId),
    // })
    //   .pipe(take(1))
    //   .subscribe(({ company }) => {
    //     this.company = company;
    //   });

    if (this.userId) {
      this.usersApiService
        .getUsers({ ids: this.userId, includeSoftDeleted: true })
        .pipe(
          tap((users) => {
            if (users.data && users.data[0]) {
              this.user = users.data[0];
              this.fetchAuth0Data(this.user.email);

              this.userForm = this.fb.group<UserFormView>({
                firstname: [this.user.firstname || '', [Validators.required]],
                lastname: [this.user.lastname || '', [Validators.required]],
                email: [this.user.email || '', [Validators.required, Validators.email]],
                roles: [this.user.roles as unknown as Array<RoleEnumApi>, []],
              });

              this.applicationsApiService.applicationsControllerGetAllPaginated({}).subscribe((res) => {
                this.applicationList = res.data ? res.data : [];
                this.listOfApplications();
                this.hasTrainXUpdate();
              });
            } else {
              throw new Error('User not found');
            }
          }),
        )
        .subscribe({
          error: (err) => {
            console.log('err in subscibe', err);
          },
        });
    } else {
      this.userForm = this.fb.group<UserFormView>({
        firstname: ['', [Validators.required]],
        lastname: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        roles: [[], []],
      });
    }
  }

  fetchAuth0Data(email: string) {
    this.authApiService.getAuth0Users({ q: email }).subscribe((q) => {
      if (q.data && q.data.length > 0) {
        this.userAuth0 = q.data[0];
      } else {
        throw new Error('user not found in auth0');
      }
    });
  }

  sendResetPassword() {
    if (!this.userForm.value) return;
    const { email } = this.userForm.value;

    this.authApiService
      .resetUserPassword({
        auth0ResetPasswordParamsDtoApi: {
          email: email,
        },
      })
      .subscribe((res) => {
        this.toastService.show({
          text: res.data,
          type: 'success',
        });
        this.btnClicked = true;
      });
  }

  listOfApplications() {
    return this.user.applicationIds?.map((app) => this.applicationList.find((a) => a.id === app));
  }

  hasTrainXUpdate() {
    this.hasTrainX = this.applicationList?.filter((app) => app.name === 'trainx').length > 0;
  }
}
