import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { EResolverData, ResolversService } from '../../core/resolvers/resolvers.service';
import { User } from '../../core/models/user.model';
import { IAppData } from '../../core/resolvers/app.resolver';

@Component({
  selector: 'alto-app-layout',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss'],
})
export class AppLayoutComponent implements OnInit {
  i = true;
  me!: User;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolverService: ResolversService,
  ) {}

  ngOnInit(): void {
    const data = this.resolverService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    this.me = (data[EResolverData.AppData] as IAppData).me;
    // Removes Splashscreen
    setTimeout(
      () => {
        document.getElementsByClassName('first-loader').item(0)?.remove();
      },
      environment.production ? 500 : 500,
    );
  }
}
