import { Component, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { Company } from '../../../core/models/company.model';
import { CompaniesRestService } from '../../companies/service/companies-rest.service';
import { ToastService } from '../../../core/toast/toast.service';
import { tap } from 'rxjs';

@Component({
  selector: 'alto-company-form',
  templateUrl: './company-form.component.html',
  styleUrls: ['./company-form.component.scss'],
})
export class CompanyFormComponent implements OnInit {
  @Input() company?: Company;
  nameControl = new FormControl('', { nonNullable: true, validators: [Validators.required] });

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

  submit(): void {
    (this.company
      ? this.companiesRestService.updateCompany(this.company.id, this.nameControl.value)
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
