import { Component, OnInit, ViewChild } from '@angular/core';
import { CompanyForm } from './models/company.create';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { IFormBuilder, IFormGroup } from 'src/app/core/form-types';
import { FormArray, FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import {
  CompanyDtoApi,
  ConnectorTimeEnumApi,
  TeamDtoApi,
  WeekDayEnumApi,
} from '@usealto/sdk-ts-angular';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';


@Component({
  selector: 'alto-companies-create',
  templateUrl: './companies-create.component.html',
  styleUrls: ['./companies-create.component.scss']
})
export class CompaniesCreateComponent implements OnInit {
  edit = false;
  company!: CompanyDtoApi;
  companyForm!: IFormGroup<CompanyForm>;
  teams: TeamDtoApi[] = [];
  id: string | undefined;
  weekDayEnum = Object.keys(WeekDayEnumApi);
  private fb: IFormBuilder;

  constructor(
    private readonly companiesRestService: CompaniesRestService,
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

    this.companyForm = this.fb.group<CompanyForm>({
      name: ['', [Validators.required]],
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
            usersHaveWebAccess: [this.company.usersHaveWebAccess],
          });
        });
    }
  }

  onSelectLogo(event: any) {
    console.log(event);
  }

  isFormDisabled(): boolean {
    return !this.companyForm.valid || this.companyForm.pristine || !this.companyForm.dirty;
  }

  async submit() {
    if (!this.companyForm.value) return;

    const { name, usersHaveWebAccess } =
      this.companyForm.value;

    if (this.edit && this.id) {
      this.companiesRestService
        .patchCompany(this.id, {
          name,
          usersHaveWebAccess: usersHaveWebAccess,
        })
        .subscribe(() => {
          this.initComponent();
          this.router.navigate(['/home/']);
        });
    } else {
      this.companiesRestService
        .createCompany({
          name,
          connectorDays: [WeekDayEnumApi.Monday, WeekDayEnumApi.Wednesday, WeekDayEnumApi.Friday],
          connectorTimes: [ConnectorTimeEnumApi._13h30],
          connectorQuestionsPerQuiz: 2,
          isConnectorActive: false,
          usersHaveWebAccess: usersHaveWebAccess,
        })
        .subscribe((company) => {
          this.router.navigate(['/home/']);
        });
    }
  }
}

