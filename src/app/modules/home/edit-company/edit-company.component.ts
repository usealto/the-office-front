import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { Company } from '../../../core/models/company.model';
import { IFormBuilder, IFormGroup } from '../../../core/form-types';
import { UntypedFormBuilder } from '@angular/forms';




@Component({
  selector: 'alto-edit-company',
  templateUrl: './edit-company.component.html',
  styleUrls: ['./edit-company.component.scss'],
})
export class EditCompanyComponent implements OnInit {
  @Input() company!: Company;

  private fb: IFormBuilder;
  companyForm!: IFormGroup<Company>;

  constructor(public activeOffcanvas: NgbActiveOffcanvas, readonly fob: UntypedFormBuilder) {
    this.fb = fob;
  }

  ngOnInit(): void {
    this.companyForm = this.fb.group<Company>(this.company);
  }
}
