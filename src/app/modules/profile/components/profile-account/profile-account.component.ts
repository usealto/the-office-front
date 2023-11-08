import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { UserDtoApi } from '@usealto/sdk-ts-angular';
import { IFormBuilder, IFormGroup } from 'src/app/core/form-types';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { UserForm } from '../../models/user.form';
import { ProfileStore } from '../../profile.store';
import { UsersRestService } from '../../services/users-rest.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { tap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { ToastService } from 'src/app/core/toast/toast.service';

@UntilDestroy()
@Component({
  selector: 'alto-profile-account',
  templateUrl: './profile-account.component.html',
  styleUrls: ['./profile-account.component.scss'],
})
export class ProfileAccountComponent implements OnInit {
  EmojiName = EmojiName;

  I18ns = I18ns;
  private fb: IFormBuilder;

  userForm!: IFormGroup<UserForm>;
  user: UserDtoApi;

  constructor(
    readonly fob: UntypedFormBuilder,
    private readonly userStore: ProfileStore,
    private readonly userRestService: UsersRestService,
    private readonly toastService: ToastService,
  ) {
    this.fb = fob;
    this.user = this.userStore.user.value;
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.userForm = this.fb.group<UserForm>({
      firstname: [this.user.firstname ?? '', [Validators.required]],
      lastname: [this.user.lastname ?? '', [Validators.required]],
      // timezone: [''],
      // country: [''],
    });
  }

  save() {
    this.userRestService
      .patchUser(this.user.id, {
        firstname: this.userForm.value?.firstname,
        lastname: this.userForm.value?.lastname,
      })
      .pipe(
        tap((u) => (this.user = u)),
        tap(() => {
          this.toastService.show({
            text: I18ns.profile.profile.form.success,
            type: 'success',
          });
          this.userForm.markAsUntouched();
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  reset() {
    this.initForm();
  }
}
