import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  NgbActiveModal,
  NgbDatepickerModule,
  NgbNavModule,
  NgbPaginationModule,
  NgbProgressbarModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { NgSelectConfig, NgSelectModule } from '@ng-select/ng-select';
import { AutoResizeTextareaDirective } from 'src/app/core/utils/directives/auto-resize-textarea.directive';
import { NgVar } from 'src/app/core/utils/directives/ng-var.directive';
import { EmojiPipe } from 'src/app/core/utils/emoji/emoji.pipe';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { LoadingModule } from 'src/app/core/utils/loading/loading.module';
import { UtilsPipeModule } from 'src/app/core/utils/pipe/utils-pipe.module';
import { ButtonGroupComponent } from './components/button-group/button-group.component';
import { DeleteModalComponent } from './components/delete-modal/delete-modal.component';
import { DropdownFilterComponent } from './components/dropdown-filter/dropdown-filter.component';
import { HeaderComponent } from './components/header/header.component';
import { IconBadgeComponent } from './components/icon-badge/icon-badge.component';
import { ImgBadgeComponent } from './components/img-badge/img-badge.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { PlaceholderManagerComponent } from './components/placeholder-manager/placeholder-manager.component';
import { ProfileCardComponent } from './components/profile-card/profile-card.component';
import { SearchComponent } from './components/search/search.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { ProgressionPillArrowPipe } from './helpers/progression-pill-arrow.pipe';
import { ProgressionPillPipe } from './helpers/progression-pill.pipe';
import { TeamColorPipe } from './helpers/team-color.pipe';
import { InputTextComponent } from './components/forms/input-text/input-text.component';
import { InputPillsComponent } from './components/forms/input-pills/input-pills.component';
import { InputSearchComponent } from './components/forms/input-search/input-search.component';

@NgModule({
  declarations: [
    ProgressionPillPipe,
    ProgressionPillArrowPipe,
    ImgBadgeComponent,
    DropdownFilterComponent,
    SearchComponent,
    TabsComponent,
    ProfileCardComponent,
    TeamColorPipe,
    PaginationComponent,
    ButtonGroupComponent,
    IconBadgeComponent,
    DeleteModalComponent,
    PlaceholderManagerComponent,
    HeaderComponent,
    InputTextComponent,
    InputPillsComponent,
    InputSearchComponent,
  ],
  imports: [
    CommonModule,
    NgbNavModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    UtilsPipeModule,
    NgbPaginationModule,
    NgbTooltipModule,
    LoadingModule,
    RouterModule,
    NgbDatepickerModule,
    NgVar,
    NgbProgressbarModule,
    AutoResizeTextareaDirective,
    EmojiPipe,
  ],
  exports: [
    NgbNavModule,
    DropdownFilterComponent,
    ProfileCardComponent,
    TabsComponent,
    SearchComponent,
    TeamColorPipe,
    ProgressionPillPipe,
    ProgressionPillArrowPipe,
    NgVar,
    FormsModule,
    ImgBadgeComponent,
    IconBadgeComponent,
    ReactiveFormsModule,
    NgbProgressbarModule,
    NgSelectModule,
    UtilsPipeModule,
    NgbPaginationModule,
    NgbTooltipModule,
    LoadingModule,
    NgbDatepickerModule,
    PaginationComponent,
    AutoResizeTextareaDirective,
    ButtonGroupComponent,
    EmojiPipe,
    DeleteModalComponent,
    PlaceholderManagerComponent,
    HeaderComponent,
    InputTextComponent,
    InputPillsComponent,
    InputSearchComponent,
  ],
  providers: [NgbActiveModal],
})
export class SharedModule {
  constructor(private config: NgSelectConfig) {
    this.config.notFoundText = I18ns.shared.textNotFound;
  }
}
