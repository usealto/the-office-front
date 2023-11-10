import { Injectable } from '@angular/core';
import {
  GetUsersRequestParams,
  UserDtoApi,
  UserDtoPaginatedResponseApi,
  UsersApiService,
} from '@usealto/the-office-sdk-angular';
import { Observable, map, tap } from 'rxjs';
import { ProfileStore } from '../profile.store';

@Injectable({
  providedIn: 'root',
})
export class UsersRestService {
  constructor(
    private readonly userApi: UsersApiService,
    private userStore: ProfileStore,
  ) {}

  getUsers(): Observable<UserDtoApi[]> {
    if (this.userStore.users.value.length) {
      return this.userStore.users.value$;
    } else {
      return this.userApi.getUsers({ page: 1, itemsPerPage: 1000 }).pipe(
        map((r) => r.data ?? []),
        tap((users) => (this.userStore.users.value = users)),
      );
    }
  }

  resetUsers() {
    this.userStore.users.value = [];
  }

  getUsersCount(params: GetUsersRequestParams): Observable<number> {
    return this.userApi.getUsers({ ...params, itemsPerPage: 1 }).pipe(map((r) => r.meta.totalItems ?? 0));
  }

  getUsersFiltered(req: GetUsersRequestParams): Observable<UserDtoApi[]> {
    return this.userApi.getUsers({ ...req }).pipe(map((r) => r.data ?? []));
  }

  getUsersPaginated(req?: GetUsersRequestParams): Observable<UserDtoPaginatedResponseApi> {
    const par = {
      ...req,
      page: req?.page ?? 1,
      itemsPerPage: req?.itemsPerPage ?? 10,
    };
    return this.userApi.getUsers(par);
  }

  getMe(): Observable<UserDtoApi> {
    if (this.userStore.user.value) {
      return this.userStore.user.value$;
    } else {
      return this.userApi.getMe().pipe(
        map((u) => u.data || ({} as UserDtoApi)),
        tap((u) => (this.userStore.user.value = u)),
      );
    }
  }

  deleteUser(id: string) {
    return this.userApi.deleteUser({ id });
  }

}
