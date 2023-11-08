import { Component, OnInit, ViewChild } from '@angular/core';
import { CompanyForm } from './models/company.create';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { IFormBuilder, IFormGroup } from 'src/app/core/form-types';
import { FormArray, FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import {
  CompanyDtoApi,
  CreateTeamDtoApi,
  SlackTimeEnumApi,
  TeamDtoApi,
  WeekDayEnumApi,
} from '@usealto/sdk-ts-angular';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamsRestService } from 'src/app/modules/lead-team/services/teams-rest.service';
import { take } from 'rxjs';
import { AdminUsersUploadFormComponent } from './admin-users-upload-form/admin-users-upload-form.component';
@Component({
  selector: 'alto-admin-companies-create',
  templateUrl: './admin-companies-create.component.html',
  styleUrls: ['./admin-companies-create.component.scss'],
})
export class AdminCompaniesCreateComponent implements OnInit {
  @ViewChild(AdminUsersUploadFormComponent) uploadFormComponent!: AdminUsersUploadFormComponent;
  edit = false;
  company!: CompanyDtoApi;
  companyForm!: IFormGroup<CompanyForm>;
  teams: TeamDtoApi[] = [];
  id: string | undefined;
  weekDayEnum = Object.keys(WeekDayEnumApi);
  private fb: IFormBuilder;

  constructor(
    private readonly companiesRestService: CompaniesRestService,
    private readonly teamService: TeamsRestService,
    private readonly router: Router,
    private route: ActivatedRoute,
    readonly fob: UntypedFormBuilder,
  ) {
    this.fb = fob;
  }

  ngOnInit(): void {
    this.initComponent();
  }

  initComponent() {
    this.id = this.route.snapshot.paramMap.get('id') || undefined;
    this.teamService
      .getTeams({ itemsPerPage: 1000 })
      .pipe(take(1))
      .subscribe((teams) => {
        this.teams = teams;
      });
    this.companyForm = this.fb.group<CompanyForm>({
      name: ['', [Validators.required]],
      teams: ['', []],
      newTeams: this.fb.array([]),
      slackDays: [[]],
      slackQuestionsPerQuiz: [undefined],
      slackActive: [false],
      slackAdmin: ['', []],
      usersHaveWebAccess: [false],
    });
    if (this.id) {
      this.edit = true;
      this.companiesRestService
        .getCompanyById(this.id)
        .pipe(take(1))
        .subscribe((company) => {
          this.company = company;
          this.companyForm = this.fb.group<CompanyForm>({
            name: [this.company.name, [Validators.required]],
            teams: [],
            newTeams: this.fb.array([]),
            slackDays: [this.company.slackDays],
            slackQuestionsPerQuiz: [this.company.slackQuestionsPerQuiz],
            slackActive: [this.company.isSlackActive],
            slackAdmin: [this.company.slackAdmin, []],
            usersHaveWebAccess: [this.company.usersHaveWebAccess],
          });
        });
    }
  }

  get newTeams() {
    return this.companyForm.controls['newTeams'] as FormArray;
  }

  // Getter needed to loop in template without typescript error
  public get newTeamsFormArrayControls() {
    return (this.companyForm.controls['newTeams'] as FormArray).controls as FormGroup[];
  }

  addTeam() {
    const teamForm = this.fb.group({
      longName: ['', []],
      shortName: ['', []],
    });
    this.newTeams.push(teamForm);
  }

  onSelectLogo(event: any) {
    console.log(event);
  }


  createTeams(companyId?: string): void {
    this.newTeams.value.forEach((team: CreateTeamDtoApi) => {
      this.teamService
        .createTeam({ name: team.name, companyId: companyId })
        .pipe(take(1))
        .subscribe((uploadedTeam) => {
          if (uploadedTeam) {
            this.teams.push(uploadedTeam);
          }
        });
    });
  }

  isFormDisabled(): boolean {
    if (!this.edit) {
      if (
        this.uploadFormComponent?.csvData?.length <= 0 ||
        !this.uploadFormComponent?.csvData.some((user) => user.roles.includes('company-admin'))
      ) {
        return true;
      }
    }
    return !this.companyForm.valid || this.companyForm.pristine || !this.companyForm.dirty;
  }

  async submit() {
    if (!this.companyForm.value) return;

    const { name, slackDays, slackActive, slackQuestionsPerQuiz, slackAdmin, usersHaveWebAccess } =
      this.companyForm.value;
    const slackTimes = ['13h30'] as SlackTimeEnumApi[];

    if (this.edit && this.id) {
      this.companiesRestService
        .patchCompany(this.id, {
          name,
          slackDays: slackDays as WeekDayEnumApi[],
          slackQuestionsPerQuiz: slackQuestionsPerQuiz as number,
          slackTimes,
          slackAdmin: slackAdmin ?? '',
          isSlackActive: slackActive,
          usersHaveWebAccess: usersHaveWebAccess,
        })
        .subscribe(() => {
          this.uploadFormComponent.upload(this.id);
          this.createTeams(this.id);
          this.initComponent();
          this.router.navigate(['/admin/home/']);
        });
    } else {
      this.companiesRestService
        .createCompany({
          name,
          slackDays: slackDays as WeekDayEnumApi[],
          slackQuestionsPerQuiz: slackQuestionsPerQuiz as number,
          slackTimes,
          slackAdmin: slackAdmin ?? '',
          isSlackActive: slackActive,
          usersHaveWebAccess: usersHaveWebAccess,
        })
        .subscribe((company) => {
          this.uploadFormComponent.upload(company.data?.id);
          this.createTeams(company.data?.id);
          this.router.navigate(['/admin/home/']);
        });
    }
  }
}
