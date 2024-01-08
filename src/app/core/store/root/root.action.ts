import { createAction, props } from '@ngrx/store';
import { Company } from '../../models/company.model';
import { EUserRole, User } from '../../models/user.model';
import { IBreadcrumbItem } from '../../../modules/shared/models/breadcrumb-item.model';
import { Application } from '../../models/application.model';

// Breadcrumb
export const setBreadcrumbItems = createAction(
  '[Breadcrumb] Set breadcrumb items',
  props<{ breadcrumbItems: IBreadcrumbItem[] }>(),
);
export const addBreadcrumbItem = createAction(
  '[Breadcrumb] Add breadcrumb item',
  props<{ breadcrumbItem: IBreadcrumbItem }>(),
);

// Me
export const setUserMe = createAction('[User] Set me', props<{ user: User }>());

// Companies
export const addCompanies = createAction('[Company] Set Companies', props<{ companies: Company[] }>());

// Users
export const setUser = createAction('[Company] Add User', props<{ user: User }>());
export const updateUserRoles = createAction(
  '[Company] Update User Roles',
  props<{ userId: string; roles: EUserRole[] }>(),
);

// Applications
export const addApplications = createAction('[Application] Set Applications', props<{ applications: Application[] }>());
