import { createAction, props } from '@ngrx/store';
import { Company } from '../../models/company.model';
import { IAuth0UserSettings, User } from '../../models/user.model';

// Me
export const setUserMe = createAction('[User] Set me', props<{ user: User }>());

// Company
export const addCompanies = createAction('[Company] Set Companies', props<{ companies: Company[] }>());
export const addUser = createAction('[Company] Add User', props<{ user: User }>());
export const updateUser = createAction('[Company] Update User', props<{ user: User }>());
