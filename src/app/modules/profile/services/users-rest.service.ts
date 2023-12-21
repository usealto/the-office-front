import { Injectable } from '@angular/core';
import {
  UserDtoApi as TrainXUserDtoApi,
  UsersApiService as TrainxUsersApiService,
} from '@usealto/sdk-ts-angular';
import {
  UserDtoApi as TheOfficeUserDtoApi,
  UsersApiService as TheofficeUsersApiService,
} from '@usealto/the-office-sdk-angular';
import { Observable, combineLatest, map, of, switchMap, tap } from 'rxjs';
import { User } from '../../../core/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UsersRestService {
  constructor(
    private readonly theofficeUserApi: TheofficeUsersApiService,
    private readonly trainxUserApi: TrainxUsersApiService,
  ) {}

  getMe(): Observable<User | undefined> {
    return combineLatest([this.theofficeUserApi.getMe(), this.trainxUserApi.getMe()]).pipe(
      map(([theofficeUser, trainxUser]) =>
        theofficeUser.data && trainxUser.data
          ? User.fromDtos(theofficeUser.data, trainxUser.data)
          : undefined,
      ),
    );
  }

  getUsersByCompany(companyId: string): Observable<User[]> {
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
            this.trainxUserApi
              .getUsers({
                page: 1,
                itemsPerPage: 1000,
                emails: usersDtos
                  .flat()
                  .map(({ email }) => email)
                  .join(','),
              })
              .pipe(
                switchMap(({ data, meta }) => {
                  const reqs: Observable<TrainXUserDtoApi[]>[] = [of(data ? data : [])];
                  let totalPages = meta.totalPage ?? 1;

                  for (let i = 2; i <= totalPages; i++) {
                    reqs.push(
                      this.trainxUserApi
                        .getUsers({ page: i, sortBy: 'createdAt:asc', itemsPerPage: 1000 })
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

  getUsers(): Observable<User[]> {
    return this.theofficeUserApi.getUsers({ page: 1, sortBy: 'createdAt:asc', itemsPerPage: 1000 }).pipe(
      switchMap(({ data, meta }) => {
        const reqs: Observable<TheOfficeUserDtoApi[]>[] = [of(data ? data : [])];
        let totalPages = meta.totalPage ?? 1;

        for (let i = 2; i <= totalPages; i++) {
          reqs.push(
            this.theofficeUserApi.getUsers({ page: i, sortBy: 'createdAt:asc', itemsPerPage: 1000 }).pipe(
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
          this.trainxUserApi
            .getUsers({
              page: 1,
              itemsPerPage: 1000,
              emails: usersDtos
                .flat()
                .map(({ email }) => email)
                .join(','),
            })
            .pipe(
              switchMap(({ data, meta }) => {
                const reqs: Observable<TrainXUserDtoApi[]>[] = [of(data ? data : [])];
                let totalPages = meta.totalPage ?? 1;

                for (let i = 2; i <= totalPages; i++) {
                  reqs.push(
                    this.trainxUserApi
                      .getUsers({ page: i, sortBy: 'createdAt:asc', itemsPerPage: 1000 })
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
}
