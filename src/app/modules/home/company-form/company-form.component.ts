import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { of, tap } from 'rxjs';

import { Company } from '../../../core/models/company.model';
import { ToastService } from '../../../core/toast/toast.service';
import { CompaniesRestService } from '../../companies/service/companies-rest.service';

@Component({
  selector: 'alto-company-form',
  templateUrl: './company-form.component.html',
  styleUrls: ['./company-form.component.scss'],
})
export class CompanyFormComponent implements OnInit {
  @Input() company?: Company;
  nameControl = new FormControl('', { nonNullable: true, validators: [this.mandatoryNameValidator()] });

  constructor(
    public activeOffcanvas: NgbActiveOffcanvas,
    private readonly companiesRestService: CompaniesRestService,
    private readonly toastService: ToastService,
  ) {}

  ngOnInit(): void {
    if (this.company) {
      this.nameControl.setValue(this.company.name);
    }
  }

  private mandatoryNameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return Validators.required(control) ? { error: 'Name is mandatory' } : null;
    };
  }

  submit(): void {
    (this.company
      ? this.nameControl.value !== this.company.name
        ? this.companiesRestService.updateCompany(this.company.id, this.nameControl.value)
        : of(this.company)
      : this.companiesRestService.createCompany(this.nameControl.value)
    )
      .pipe(tap(() => this.activeOffcanvas.close()))
      .subscribe({
        complete: () => {
          this.toastService.show({
            type: 'success',
            text: this.company ? 'Company updated' : 'Company created',
          });
        },
        error: () => {
          this.toastService.show({
            type: 'danger',
            text: this.company ? 'Error while updating company' : 'Error while creating company',
          });
        },
      });
  }
}
