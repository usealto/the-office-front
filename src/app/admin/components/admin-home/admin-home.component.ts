import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { tap } from 'rxjs';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { UserDtoApi } from '@usealto/sdk-ts-angular';

@Component({
  selector: 'alto-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.scss'],
})
export class AdminHomeComponent implements OnInit {
  users: UserDtoApi[] = [];

  userForm: any;
  constructor(private readonly userRestService: UsersRestService, private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.userForm = this.formBuilder.group({
      name: '',
    });
  }

  submit() {
    console.log(this.userForm.value);
  }
}
