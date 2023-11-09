import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, take, tap } from 'rxjs';
import { IFormBuilder, IFormGroup } from 'src/app/core/form-types';
import {
  AdminApiService,
  AuthApiService,
  CompanyDtoApi,
  RoleEnumApi,
  TeamDtoApi,
  UserDtoApi,
  UserDtoApiRolesEnumApi,
} from '@usealto/sdk-ts-angular';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from 'src/app/core/toast/toast.service';
import { environment } from 'src/environments/environment';

interface UserFormView {
  firstname: string;
  lastname: string;
  teamId: string;
  email: string;
  roles: Array<RoleEnumApi>;
}

interface AuthUserMetadata {
  bubbleId: string;
  companyId: string;
  teamId: string;
  altoId: string;
} 

interface AuthUserGet {
  app_metadata: string;
  created_at: string;
  email: string;
  email_verified : string;
  identities: string[]
  last_ip: string;
  last_login: string; 
  logins_count: number
  name: string; 
  nickname  : string;
  picture: string;
  updated_at :  string;
  user_id: string;
  user_metadata: AuthUserMetadata;
  username: string; 
} 

@Component({
  selector: 'alto-company-user',
  templateUrl: './company-user.component.html',
  styleUrls: ['./company-user.component.scss']
})
export class CompanyUserComponent implements OnInit {
  companyId!: string;
  teams: TeamDtoApi[] = [];
  userForm!: IFormGroup<UserFormView>;
  private fb: IFormBuilder;
  rolesPossibleValues = Object.values(UserDtoApiRolesEnumApi);
  userId!: string;
  userAuth0!: AuthUserGet;
  user!: UserDtoApi;
  company!: CompanyDtoApi;
  trainxURL?: string; 

  constructor(
    private route: ActivatedRoute,
    readonly fob: UntypedFormBuilder,
    private readonly authApiService: AuthApiService,
    private readonly companiesRestService: CompaniesRestService,
    private readonly toastService: ToastService,
    private modalService: NgbModal,
    private readonly adminApiService: AdminApiService,
  ) {
    this.fb = fob;
  }

  async ngOnInit(): Promise<void> {
    this.companyId = this.route.snapshot.paramMap.get('companyId') || '';
    this.userId = this.route.snapshot.paramMap.get('userId') || '';

    combineLatest({
      company: this.companiesRestService.getCompanyById(this.companyId),
    })
      .pipe(take(1))
      .subscribe(({ company }) => {
        this.company = company; 
      });

    if (this.userId) {
      this.adminApiService
        .adminGetUsers({ ids: this.userId, includeSoftDeleted: true })
        .pipe(
          tap((users) => {
            if (users.data && users.data[0]) {
              console.log(users);
                            
              this.user = users.data[0];
              this.fetchAuth0Data(this.user.email);

              this.userForm = this.fb.group<UserFormView>({
                firstname: [this.user.firstname || '', [Validators.required]],
                lastname: [this.user.lastname || '', [Validators.required]],
                teamId: [this.user.teamId || '', [Validators.required]],
                email: [this.user.email || '', [Validators.required, Validators.email]],
                roles: [this.user.roles as unknown as Array<RoleEnumApi>, []],
              });

              
              this.trainxURL = `${environment.trainxURL}/impersonate/${this.user.email}?auto=true`;
              

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
        teamId : ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        roles: [[RoleEnumApi.CompanyUser], []],
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
      .subscribe((res) => this.toastService.show({
        text: res.data,
        type: 'success',
      }));
  }
}
