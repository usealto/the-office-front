import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Company } from '../../core/models/company.model';
import { User } from '../../core/models/user.model';
import { IAppData } from '../../core/resolvers/app.resolver';
import { EResolverData, ResolversService } from '../../core/resolvers/resolvers.service';
import { EmojiName } from '../../core/utils/emoji/data';
import { EPlaceholderStatus } from '../shared/models/placeholder.model';

@Component({
  selector: 'alto-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  Emoji = EmojiName;

  me!: User;
  companiesById = new Map<string, Company>();
  filteredCompanies: Company[] = [];
  companiesDataStatus = EPlaceholderStatus.Good;

  searchTerm: FormControl<string | null> = new FormControl(null);
  homeSubscription = new Subscription();

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolverService: ResolversService,
  ) {}

  ngOnInit(): void {
    const data = this.resolverService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    this.companiesById = (data[EResolverData.AppData] as IAppData).companiesById;
    this.me = (data[EResolverData.AppData] as IAppData).me;
    this.filteredCompanies = Array.from(this.companiesById.values());

    this.companiesDataStatus = this.companiesById.size ? EPlaceholderStatus.Good : EPlaceholderStatus.NoData;

    this.homeSubscription.add(
      this.searchTerm.valueChanges.subscribe((searchTerm) => {
        this.filteredCompanies = Array.from(this.companiesById.values()).filter((company) => {
          if (!searchTerm) return true;
          return company.name.toLowerCase().includes(searchTerm.toLowerCase());
        });

        this.companiesDataStatus = this.filteredCompanies.length
          ? EPlaceholderStatus.Good
          : EPlaceholderStatus.NoResult;
      }),
    );
  }

  ngOnDestroy(): void {
    this.homeSubscription.unsubscribe();
  }

  resetSearch(): void {
    this.searchTerm.setValue(null);
  }
}
