import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs';
import {
  AdminApiService,
  UserDtoApi,
} from '@usealto/sdk-ts-angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'alto-user-trainx',
  templateUrl: './user-trainx.component.html',
  styleUrls: ['./user-trainx.component.scss']
})
export class UserTrainxComponent implements OnInit {
  @Input() userEmail!: string;
  user!: UserDtoApi;
  team: string = '';
  isConnectorActive?: boolean | undefined;
  trainxURL: string = '';

  constructor(
    private route: ActivatedRoute,
    readonly fob: UntypedFormBuilder,
    private readonly adminApiService: AdminApiService,
  ) {}

  async ngOnInit(): Promise<void> {
    // this.userId = this.route.snapshot.paramMap.get('userId') || '';
    if (this.userEmail) {
      this.adminApiService
        .adminGetUsers({ emails: this.userEmail, includeSoftDeleted: true })
        .pipe(
          tap((users) => {
            if (users.data && users.data[0]) {                            
              this.user = users.data[0];
              this.team = this.user.team?.name || 'NA';
              this.isConnectorActive = this.user.isConnectorActive
              this.trainxURL = `${environment.trainxURL}/impersonate/${this.userEmail}?auto=true`;
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
