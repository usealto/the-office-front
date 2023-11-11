import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs';
import {
  UserDtoApi,
  UsersApiService,
} from '@usealto/sdk-ts-angular';

@Component({
  selector: 'alto-user-trainx',
  templateUrl: './user-trainx.component.html',
  styleUrls: ['./user-trainx.component.scss']
})
export class UserTrainxComponent implements OnInit {
  userId!: string;
  user!: UserDtoApi;
  team: string = '';
  isConnectorActive?: boolean | undefined;

  constructor(
    private route: ActivatedRoute,
    readonly fob: UntypedFormBuilder,
    private readonly usersApiService: UsersApiService,
  ) {}

  async ngOnInit(): Promise<void> {
    // this.userId = this.route.snapshot.paramMap.get('userId') || '';
    console.log('this.userId', this.userId);
    

    if (this.userId) {
      this.usersApiService
        .getUsers({ ids: this.userId, includeSoftDeleted: true })
        .pipe(
          tap((users) => {
            if (users.data && users.data[0]) {                            
              this.user = users.data[0];
              this.team = this.user.team?.name || 'NA';
              this.isConnectorActive = this.user.isConnectorActive
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
      console.log('no user id');
    }

    
  }
}
