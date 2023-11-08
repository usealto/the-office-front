import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as Papa from 'papaparse';
import { tap } from 'rxjs';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { TeamsRestService } from 'src/app/modules/lead-team/services/teams-rest.service';
import { CompanyDtoApi, TeamDtoApi, UsersApiService } from '@usealto/sdk-ts-angular';
import { UserCreate } from './models/user.create';

@Component({
  selector: 'alto-admin-users-upload',
  templateUrl: './admin-users-upload.component.html',
  styleUrls: ['./admin-users-upload.component.scss'],
})
export class AdminUsersUploadComponent implements OnInit {
  csvData: UserCreate[] = [];
  id!: string;
  company!: CompanyDtoApi;
  teams: TeamDtoApi[] = [];
  reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  usersFailed: string[] = [];

  constructor(
    private readonly companiesRestService: CompaniesRestService,
    private readonly usersApiService: UsersApiService,
    private readonly teamsRestService: TeamsRestService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';

    this.companiesRestService
      .getCompanyById(this.id)
      .pipe(tap((company) => (this.company = company)))
      .subscribe();

    this.teamsRestService
      .getTeams({ companyId: this.id, itemsPerPage: 1000 })
      .pipe(tap((teams) => (this.teams = teams)))
      .subscribe();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    Papa.parse(file, {
      complete: (results: { data: any[] }) => {
        results.data.forEach((userRow: string[]) => {
          console.log(userRow);
          // if (this.reg.test(userRow[0])) {
          //   const user = {
          //     email: userRow[0],
          //     teamId: this.findSelectedTeam(userRow[1]),
          //     companyId: this.id,
          //     isUploaded: false,
          //   };
          //   this.csvData.push(user);
          // } else {
          //   this.usersFailed.push(userRow[0]);
          // }
        });
        if (this.csvData && this.csvData[0] && this.csvData[0].email === 'email') {
          this.csvData = this.csvData.slice(1);
        }
      },
    });
  }

  upload() {
    this.csvData.forEach((user) => {
      this.usersApiService
        .createUser({
          createUserDtoApi: {
            firstname: '',
            lastname: '',
            email: user.email,
            companyId: this.id,
            teamId: user.teamId,
          },
        })
        .subscribe((res) => {
          if (res.statusCode === 201) {
            user.isUploaded = true;
          }
        });
    });
  }

  findSelectedTeam(teamName: string) {
    return this.teams.find((team) => team.name === teamName)?.id;
  }
}
