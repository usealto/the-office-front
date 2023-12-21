import { createReducer, on } from '@ngrx/store';

import { Company } from '../../models/company.model';
import { IUser, User } from '../../models/user.model';
import { addCompanies, setUserMe } from '../root/root.action';

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
}

export const initialState: RootState = {
  me: new TimestampedEntity<User>(new User({} as IUser), null),
  companiesById: new TimestampedEntity<Map<string, Company>>(new Map(), null),
};

export const rootReducer = createReducer(
  initialState,
  on(
    setUserMe,
    (state, { user }): RootState => ({
      ...state,
      me: new TimestampedEntity<User>(user),
    }),
  ),
  on(
    addCompanies,
    (state, { companies }): RootState => ({
      ...state,
      companiesById: new TimestampedEntity<Map<string, Company>>(
        new Map<string, Company>(companies.map((c) => [c.id, new Company(c)])),
      ),
    }),
  ),
);
