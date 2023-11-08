import { Component, OnInit } from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { Router } from '@angular/router';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { EmojiName } from 'src/app/core/utils/emoji/data';
@Component({
  selector: 'alto-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
})
export class NotFoundComponent implements OnInit {
  AltoRoutes = AltoRoutes;
  I18ns = I18ns;
  Emoji = EmojiName;
  route: string[] = [];

  constructor(public readonly userStore: ProfileStore, private readonly router: Router) {}

  ngOnInit(): void {
    this.route = ['/', AltoRoutes.home];
  }
}
