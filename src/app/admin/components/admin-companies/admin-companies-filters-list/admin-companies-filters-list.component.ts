import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { IFormBuilder, IFormGroup } from 'src/app/core/form-types';
import { TeamDtoApi, UserDtoApiRolesEnumApi, WeekDayEnumApi } from '@usealto/sdk-ts-angular';

export interface FiltersCompaniesList {
  teams?: TeamDtoApi;
  isSlackActive?: boolean | null;
  userAdmin?: boolean | null;
  sendingDays?: WeekDayEnumApi[];
  nbQuestions: {
    min?: number;
    max?: number;
  };
}

@Component({
  selector: 'alto-admin-companies-filters-list',
  templateUrl: './admin-companies-filters-list.component.html',
  styleUrls: ['./admin-companies-filters-list.component.scss'],
})
export class AdminCompaniesFiltersListComponent implements OnInit {
  @Input() filters: FiltersCompaniesList | undefined;
  private fb: IFormBuilder;
  SendingDaysValues = Object.keys(WeekDayEnumApi);
  userForm!: IFormGroup<any>;

  constructor(public activeOffcanvas: NgbActiveOffcanvas, readonly fob: UntypedFormBuilder) {
    this.fb = fob;
  }
  ngOnInit(): void {
    if (this.filters) {
      this.userForm = this.fb.group<FiltersCompaniesList>({
        teams: [this.filters.teams],
        isSlackActive: [this.filters.isSlackActive],
        userAdmin: [this.filters.userAdmin],
        sendingDays: [this.filters.sendingDays],
        nbQuestions: this.fb.group<any>({
          min: [this.filters.nbQuestions.min],
          max: [this.filters.nbQuestions.max],
        }),
      });
    } else {
      this.userForm = this.fb.group<FiltersCompaniesList>({
        teams: [null],
        isSlackActive: [null],
        userAdmin: [null],
        sendingDays: [null],
        nbQuestions: this.fb.group<any>({
          min: [''],
          max: [''],
        }),
      });
    }
  }
}
