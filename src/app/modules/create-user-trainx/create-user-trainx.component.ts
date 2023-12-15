import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, take, tap } from 'rxjs';
import { IFormBuilder, IFormGroup } from 'src/app/core/form-types';
import { CompanyDtoApi } from '@usealto/the-office-sdk-angular';
import { RoleEnumApi, UsersApiService } from '@usealto/sdk-ts-angular';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { AltoRoutes } from '../shared/constants/routes';
import { ToastService } from 'src/app/core/toast/toast.service';

interface UserFormView {
  firstname: string;
  lastname: string;
  email: string;
  roles: Array<RoleEnumApi>;
}

@Component({
  selector: 'alto-create-user-trainx',
  templateUrl: './create-user-trainx.component.html',
  styleUrls: ['./create-user-trainx.component.scss'],
})
export class CreateUserTrainxComponent implements OnInit {
  companyId!: string;
  userForm!: IFormGroup<UserFormView>;
  private fb: IFormBuilder;
  // user!: UserDtoApi;
  company!: CompanyDtoApi;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    readonly fob: UntypedFormBuilder,
    private readonly companiesRestService: CompaniesRestService,
    private readonly usersApiService: UsersApiService,
    private readonly toastService: ToastService,
  ) {
    this.fb = fob;
  }

  async ngOnInit(): Promise<void> {
    this.companyId = this.route.snapshot.paramMap.get('companyId') || '';

    // combineLatest({
    //   company: this.companiesRestService.getCompanyById(this.companyId),
    // })
    //   .pipe(take(1))
    //   .subscribe(({ company }) => {
    //     this.company = company;
    //   });

    this.userForm = this.fb.group<UserFormView>({
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      roles: [[RoleEnumApi.CompanyAdmin, RoleEnumApi.CompanyUser], []],
    });
  }

  async submit() {
    if (!this.userForm.value) return;
    if (!this.company) return;

    const createUserDtoApi = {
      firstname: this.userForm.value.firstname,
      lastname: this.userForm.value.lastname,
      email: this.userForm.value.email,
      roles: this.userForm.value.roles,
      companyId: this.company.id,
    };

    this.usersApiService
      .createUser({
        createUserDtoApi: createUserDtoApi,
      })
      .subscribe({
        next: (res) => {
          this.toastService.show({
            text: 'user created',
            type: 'success',
          });
          this.router.navigate(['/' + AltoRoutes.companies + '/' + this.companyId + '/users']);
        },
        // if there is a problem in the user creation process, send a error toast
        error: (error) => {
          this.toastService.show({
            text: 'error while creating user',
            type: 'danger',
          });
        },
      });
  }

  isFormDisabled(): boolean {
    return !this.userForm.valid || this.userForm.pristine || !this.userForm.dirty;
  }
}
