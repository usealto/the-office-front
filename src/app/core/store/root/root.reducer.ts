import { createReducer, on } from '@ngrx/store';

import { Company } from '../../models/company.model';
import { IUser, User } from '../../models/user.model';
import {
  setApplications,
  addBreadcrumbItem,
  addCompanies,
  setBreadcrumbItems,
  setUser,
  setUserMe,
  updateUserRoles,
} from '../root/root.action';
import { IBreadcrumbItem } from '../../../modules/shared/models/breadcrumb-item.model';
import { Application } from '../../models/application.model';

export class TimestampedEntity<T> {
  data: T;
  timestamp: Date | null;

  constructor(data: T, timestamp?: Date | null) {
    this.data = data;
    this.timestamp = timestamp === null ? null : timestamp ?? new Date();
  }

  needsUpdate(): boolean {
    return this.timestamp === null || Date.now() - this.timestamp.getTime() > 60000;
  }
}

export interface RootState {
  me: TimestampedEntity<User>;
  companiesById: TimestampedEntity<Map<string, Company>>;
  breadcrumbItems: IBreadcrumbItem[];
  applicationsById: TimestampedEntity<Map<string, Application>>;
}

export const initialState: RootState = {
  me: new TimestampedEntity<User>(new User({} as IUser), null),
  companiesById: new TimestampedEntity<Map<string, Company>>(new Map(), null),
  breadcrumbItems: [],
  applicationsById: new TimestampedEntity<Map<string, Application>>(new Map(), null),
};

export const rootReducer = createReducer(
  initialState,
  on(
    setBreadcrumbItems,
    (state, { breadcrumbItems }): RootState => ({
      ...state,
      breadcrumbItems,
    }),
  ),
  on(
    addBreadcrumbItem,
    (state, { breadcrumbItem }): RootState => ({
      ...state,
      breadcrumbItems: [...state.breadcrumbItems, breadcrumbItem],
    }),
  ),
  on(
    setUserMe,
    (state, { user }): RootState => ({
      ...state,
      me: new TimestampedEntity<User>(user),
    }),
  ),
  on(addCompanies, (state, { companies }): RootState => {
    const companiesById = new Map<string, Company>(
      [...state.companiesById.data.values()].map((company) => [company.id, company]),
    );
    companies.forEach((company) => companiesById.set(company.id, company));
    return {
      ...state,
      companiesById: new TimestampedEntity<Map<string, Company>>(companiesById),
    };
  }),
  on(setUser, (state, { user }): RootState => {
    const companiesById = new Map<string, Company>(
      [...state.companiesById.data.values()].map((company) => [company.id, company]),
    );
    const company = companiesById.get(user.companyId);
    if (company) {
      const updatedCompany = new Company(company.rawData);
      updatedCompany.addUser(user);
      companiesById.set(company.id, updatedCompany);
    }
    return {
      ...state,
      companiesById: new TimestampedEntity<Map<string, Company>>(companiesById),
    };
  }),
  on(updateUserRoles, (state, { userId, roles }): RootState => {
    const companiesById = new Map<string, Company>(
      [...state.companiesById.data.values()].map((company) => [company.id, company]),
    );
    const company = companiesById.get(state.me.data.companyId);
    if (company) {
      const updatedCompany = new Company(company.rawData);
      const user = updatedCompany.usersById.get(userId);

      if (user) {
        const newUser = new User({ ...user.rawData, roles });
        updatedCompany.addUser(newUser);
        companiesById.set(company.id, updatedCompany);
      }
    }
    return {
      ...state,
      companiesById: new TimestampedEntity<Map<string, Company>>(companiesById),
    };
  }),
  on(setApplications, (state, { applications }): RootState => {
    const applicationsById = new Map<string, Application>(
      [...state.applicationsById.data.values()].map((application) => [application.id, application]),
    );
    applications.forEach((application) => applicationsById.set(application.id, application));
    return {
      ...state,
      applicationsById: new TimestampedEntity<Map<string, Application>>(applicationsById),
    };
  }),
);
