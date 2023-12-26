import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Company } from '../../core/models/company.model';
import { User } from '../../core/models/user.model';
import { ICompanyUsersData } from '../../core/resolvers/companyUsers.resolver';
import { EResolverData, ResolversService } from '../../core/resolvers/resolvers.service';
import { EmojiName } from '../../core/utils/emoji/data';
import { UserDtoApiRolesEnumApi } from '@usealto/the-office-sdk-angular';

@Component({
  selector: 'alto-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UserComponent implements OnInit {
  readonly Emoji = EmojiName;
  roles = Object.values(UserDtoApiRolesEnumApi);

  company!: Company;
  user!: User;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolverService: ResolversService,
  ) {}

  ngOnInit(): void {
    const data = this.resolverService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    const dataFromResolver = data[EResolverData.CompanyUsersData] as ICompanyUsersData;
    this.company = dataFromResolver.company;
    this.user = this.company.usersById.get(this.activatedRoute.snapshot.params['userId']) as User;
  }
}
