import { ShowRawDataModalComponent } from './show-raw-data-modal/show-raw-data-modal.component';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, take, tap } from 'rxjs';
import { IFormBuilder, IFormGroup } from 'src/app/core/form-types';
import { TeamsRestService } from 'src/app/modules/lead-team/services/teams-rest.service';
import {
  AdminApiService,
  AuthApiService,
  CompanyDtoApi,
  RoleEnumApi,
  TeamDtoApi,
  UserDtoApi,
  UserDtoApiRolesEnumApi,
} from '@usealto/sdk-ts-angular';
import { UserFormView } from '../admin-user-create/admin-user-create-form/models/user.form';
import { AuthUserGet } from './models/authuser.get';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from '../../admin-data.service';
import { ToastService } from 'src/app/core/toast/toast.service';

@Component({
  selector: 'alto-admin-company-user',
  templateUrl: './admin-company-user.component.html',
  styleUrls: ['./admin-company-user.component.scss'],
})

export class AdminCompanyUserComponent implements OnInit {
  companyId!: string;
  teams: TeamDtoApi[] = [];
  userForm!: IFormGroup<UserFormView>;
  private fb: IFormBuilder;
  rolesPossibleValues = Object.values(UserDtoApiRolesEnumApi);
  userId!: string;
  userAuth0!: AuthUserGet;
  user!: UserDtoApi;
  company!: CompanyDtoApi;

  constructor(
    private route: ActivatedRoute,
    private readonly teamsRestService: TeamsRestService,
    readonly fob: UntypedFormBuilder,
    private readonly authApiService: AuthApiService,
    private readonly companiesRestService: CompaniesRestService,
    private readonly toastService: ToastService,
    private modalService: NgbModal,
    private readonly dataService: DataService,
    private readonly adminApiService: AdminApiService,
  ) {
    this.fb = fob;
  }

  async ngOnInit(): Promise<void> {
    this.companyId = this.route.snapshot.paramMap.get('companyId') || '';
    this.userId = this.route.snapshot.paramMap.get('userId') || '';

    combineLatest({
      teams: this.teamsRestService.getTeams({ companyId: this.companyId, itemsPerPage: 1000 }),
      company: this.companiesRestService.getCompanyById(this.companyId),
    })
      .pipe(take(1))
      .subscribe(({ company, teams }) => {
        this.company = company;
        this.teams = teams;        
      });

    if (this.userId) {
      this.adminApiService
        .adminGetUsers({ ids: this.userId, includeSoftDeleted: true })
        .pipe(
          tap((users) => {
            if (users.data && users.data[0]) {
              this.user = users.data[0];
              this.fetchAuth0Data(this.user.email);

              this.userForm = this.fb.group<UserFormView>({
                firstname: [this.user.firstname || '', [Validators.required]],
                lastname: [this.user.lastname || '', [Validators.required]],
                teamId: [this.user.teamId || '', [Validators.required]],
                email: [this.user.email || '', [Validators.required, Validators.email]],
                roles: [this.user.roles as unknown as Array<RoleEnumApi>, []],
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
        teamId : ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        roles: [[RoleEnumApi.CompanyUser], []],
      });
    }
  }

  showRawDataModal() {
    const modalRef = this.modalService.open(ShowRawDataModalComponent, {
      centered: true,
      scrollable: true,
      size: 'xl',
    });
    modalRef.componentInstance.userAuth0 = this.userAuth0;
    modalRef.componentInstance.user = this.user;
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

  impersonnate(email: string) {
    localStorage.setItem('impersonatedUser', email.toLowerCase());
    this.dataService.sendData('impersonatedUserUpdated');
  }

  
}
