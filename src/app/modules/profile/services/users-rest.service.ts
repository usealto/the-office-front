import { Injectable } from '@angular/core';
import {
  UserDtoApi as TrainXUserDtoApi,
  UsersApiService as TrainxUsersApiService,
  AdminApiService as TrainxAdminApiService,
} from '@usealto/sdk-ts-angular';
import {
  RoleEnumApi,
  UserDtoApi as TheOfficeUserDtoApi,
  UsersApiService as TheofficeUsersApiService,
  AuthApiService,
} from '@usealto/the-office-sdk-angular';

import { Observable, catchError, combineLatest, map, of, switchMap, tap } from 'rxjs';
import { EUserRole, User } from '../../../core/models/user.model';

import { User as Auth0User } from '@auth0/auth0-spa-js';

@Injectable({
  providedIn: 'root',
})
export class UsersRestService {
  constructor(
    private readonly theofficeUserApi: TheofficeUsersApiService,
    private readonly trainxUserApi: TrainxUsersApiService,
    private readonly trainxAdminApi: TrainxAdminApiService,
    private readonly auth0Api: AuthApiService,
  ) {}

  private mapRoles(roles: EUserRole[]): RoleEnumApi[] {
    return roles
      .map((role) => {
        switch (role) {
          case EUserRole.AltoAdmin:
            return RoleEnumApi.AltoAdmin;
          case EUserRole.BillingAdmin:
            return RoleEnumApi.BillingAdmin;
          case EUserRole.RecordxLead:
            return RoleEnumApi.RecordxLead;
          case EUserRole.RecordxUser:
            return RoleEnumApi.RecordxUser;
          case EUserRole.TrainxLead:
            return RoleEnumApi.TrainxLead;
          case EUserRole.TrainxUser:
            return RoleEnumApi.TrainxUser;
          default:
            return null;
        }
      })
      .filter((r) => !!r) as RoleEnumApi[];
  }

  getMe(): Observable<User | undefined> {
    return combineLatest([
      this.theofficeUserApi.getMe(),
      this.trainxUserApi.getMe().pipe(
        catchError((e) => {
          // If we can, we specify the error cause
          if (e.status === 401) {
            throw new Error('TheOffice does not allow users without a Trainx account in this version.');
          }
          throw e;
        }),
      ),
    ]).pipe(
      map(([theofficeUser, trainxUser]) =>
        theofficeUser.data && trainxUser.data
          ? User.fromDtos(theofficeUser.data, trainxUser.data)
          : undefined,
      ),
    );
  }

  getUsersByCompanyId(companyId: string): Observable<User[]> {
    return this.theofficeUserApi
      .getUsers({ page: 1, sortBy: 'createdAt:asc', itemsPerPage: 1000, companyId })
      .pipe(
        switchMap(({ data, meta }) => {
          const reqs: Observable<TheOfficeUserDtoApi[]>[] = [of(data ? data : [])];
          let totalPages = meta.totalPage ?? 1;

          for (let i = 2; i <= totalPages; i++) {
            reqs.push(
              this.theofficeUserApi
                .getUsers({ page: i, sortBy: 'createdAt:asc', itemsPerPage: 1000, companyId })
                .pipe(
                  tap(({ meta }) => {
                    if (meta.totalPage !== totalPages) {
                      totalPages = meta.totalPage;
                    }
                  }),
                  map(({ data }) => (data ? data : [])),
                ),
            );
          }
          return combineLatest(reqs);
        }),
        switchMap((usersDtos) => {
          return combineLatest([
            of(usersDtos.flat()),
            this.trainxAdminApi
              .getUsersFromTheOfficeCompanyId({
                theOfficeCompanyId: companyId,
                page: 1,
                itemsPerPage: 1000,
              })
              .pipe(
                switchMap(({ data, meta }) => {
                  const reqs: Observable<TrainXUserDtoApi[]>[] = [of(data ? data : [])];
                  let totalPages = meta.totalPage ?? 1;

                  for (let i = 2; i <= totalPages; i++) {
                    reqs.push(
                      this.trainxAdminApi
                        .getUsersFromTheOfficeCompanyId({
                          theOfficeCompanyId: companyId,
                          page: i,
                          sortBy: 'createdAt:asc',
                          itemsPerPage: 1000,
                        })
                        .pipe(
                          tap(({ meta }) => {
                            if (meta.totalPage !== totalPages) {
                              totalPages = meta.totalPage;
                            }
                          }),
                          map(({ data }) => (data ? data : [])),
                        ),
                    );
                  }
                  return combineLatest(reqs);
                }),
              ),
          ]);
        }),
        map(([theofficeUsers, trainxUsers]) => {
          return theofficeUsers.map((theofficeUser) => {
            const trainxUser = trainxUsers
              .flat()
              .find((trainxUser) => trainxUser.email === theofficeUser.email);
            return User.fromDtos(theofficeUser, trainxUser);
          });
        }),
      );
  }

  getUsersCountByEmails(emails: string[]): Observable<number> {
    return this.theofficeUserApi
      .getUsers({ emails: emails.join(',') })
      .pipe(map(({ meta }) => meta.totalItems));
  }

  createUser(
    firstname: string,
    lastname: string,
    email: string,
    roles: EUserRole[],
    companyId: string,
  ): Observable<User> {
    return this.theofficeUserApi
      .createUser({
        createUserDtoApi: {
          firstname,
          lastname,
          email,
          companyId,
          roles: this.mapRoles(roles),
        },
      })
      .pipe(map(({ data }) => User.fromDtos(data as TheOfficeUserDtoApi)));
  }

  updateUser(userId: string, roles: EUserRole[]): Observable<User> {
    return this.theofficeUserApi
      .patchUser({
        id: userId,
        patchUserDtoApi: {
          roles: this.mapRoles(roles),
        },
      })
      .pipe(map(({ data }) => User.fromDtos(data as TheOfficeUserDtoApi)));
  }

  getAuth0User(userId: string): Observable<Auth0User> {
    return this.auth0Api.getAuth0Users({ q: `user_id:${userId}` }).pipe(
      map((res) => {
        return res.data[0];
      }),
    );
  }

  auth0ResetPassword(userEmail: string): Observable<Auth0User> {
    return this.auth0Api
      .resetUserPassword({
        auth0ResetPasswordParamsDtoApi: {
          email: userEmail,
        },
      })
      .pipe(tap((res) => console.log(res)));
  }
}
