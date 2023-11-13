
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, take } from 'rxjs';
import { CompaniesApiService, CompanyDtoApi, UserDtoApi, UserDtoApiRolesEnumApi, UsersApiService } from '@usealto/the-office-sdk-angular';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'alto-company-users',
  templateUrl: './company-users.component.html',
  styleUrls: ['./company-users.component.scss']
})
export class CompanyUsersComponent implements OnInit {
  company!: CompanyDtoApi;
  users: UserDtoApi[] = [];
  hasTrainXLead = true;
  hasRecordXLead = true;
  id: string | undefined;
  eRolesEnum = UserDtoApiRolesEnumApi;
  displayedUsers: UserDtoApi[] = [];
  selectedUsers: UserDtoApi[] = [];
  page = 1;
  pageSize = 15;
  pageCount = 0;
  searchString = '';
  
  constructor(
    private readonly companiesApiService: CompaniesApiService,
    private readonly usersApiService: UsersApiService,
    private route: ActivatedRoute,
    private readonly offcanvasService: NgbOffcanvas,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.fetchAll();    
  }

  fetchAll() {
    combineLatest({
      company: this.companiesApiService.getCompanies({ ids: this.id }),
      users: this.usersApiService.getUsers({ companyId: this.id, itemsPerPage: 1000, includeSoftDeleted: true, sortBy: 'deletedAt:desc,firstname:asc'  })
    })
      .pipe(take(1))
      .subscribe(({ company, users, }) => {
        this.company = (company?.data) ? company.data[0] : {} as CompanyDtoApi;
        this.users = users.data || [];
        this.pageCount = Math.ceil(this.users.length / this.pageSize);
        this.refreshUsers();
        this.updateHasLeads()
      });
  }

  selectAll(event: any) {
    this.selectedUsers = event.target.checked ? [...this.users] : [];
  }

  onPaginator(page: number) {
    this.page = page;
    this.refreshUsers();
  }

  onSearch(search: string) {
    this.searchString = search;
    this.refreshUsers();
  }

  refreshUsers() {
    let tmpUsers = this.users;

    if (this.searchString !== '') {
      tmpUsers = tmpUsers.filter((user) => {
        const term = this.searchString.toLowerCase();
        return (
          user.firstname?.toLowerCase().includes(term) ||
          user.lastname?.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term)
        );
      });
    }

    this.pageCount = Math.ceil(tmpUsers.length / this.pageSize);

    this.displayedUsers = tmpUsers.slice(
      (this.page - 1) * this.pageSize,
      (this.page - 1) * this.pageSize + this.pageSize,
    );
  }

  updateHasLeads(){
    this.hasTrainXLead = this.users.length > 0 && this.users.some(user => user.roles.includes(UserDtoApiRolesEnumApi.TrainxLead))
    this.hasRecordXLead = this.users.length > 0 && this.users.some(user => user.roles.includes(UserDtoApiRolesEnumApi.RecordxLead))
  }

}
