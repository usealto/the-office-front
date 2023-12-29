import { UserDtoApi as TrainXUserDto } from '@usealto/sdk-ts-angular';
import { UserDtoApi as TheOfficeUserDtoApi, UserDtoApiRolesEnumApi } from '@usealto/the-office-sdk-angular';
import { environment } from '../../../environments/environment';

export enum EUserRole {
  TrainxLead = 'trainx-lead',
  TrainxUser = 'trainx-user',
  RecordxLead = 'recordx-lead',
  RecordxUser = 'recordx-user',
  AltoAdmin = 'alto-admin',
  BillingAdmin = 'billing-admin',
}

export interface IUser {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  roles: Array<EUserRole>;
  createdAt: Date;
  updatedAt: Date;
  companyId: string;
  emailVerified: boolean;
  trainxSettings: ITrainxUserSettings;
  recordxSettings: IRecordxUserSettings;
  auth0Settings: IAuth0UserSettings;
}

export interface ITrainxUserSettings {
  deletedAt?: Date;
  isConnectorActive?: boolean;
  hasLicense: boolean;
}

export class TrainxUserSettings {
  deletedAt?: Date;
  isConnectorActive?: boolean;
  hasLicense: boolean;

  constructor(data: ITrainxUserSettings) {
    this.deletedAt = data.deletedAt;
    this.isConnectorActive = data.isConnectorActive;
    this.hasLicense = data.hasLicense;
  }

  get rawData(): ITrainxUserSettings {
    return {
      deletedAt: this.deletedAt,
      isConnectorActive: this.isConnectorActive,
      hasLicense: this.hasLicense,
    };
  }
}

export interface IRecordxUserSettings {
  hasLicense: boolean;
}

export class RecordxUserSettings {
  hasLicense: boolean;

  constructor(data: IRecordxUserSettings) {
    this.hasLicense = data.hasLicense;
  }

  get rawData(): IRecordxUserSettings {
    return {
      hasLicense: this.hasLicense,
    };
  }
}

export interface IAuth0UserSettings {
  id: string;
  infos?: {
    loginsCount: number;
    isConnected: boolean;
    lastLogin: Date;
  };
}

export class Auth0UserSettings implements IAuth0UserSettings {
  id: string;
  infos?: {
    loginsCount: number;
    isConnected: boolean;
    lastLogin: Date;
  };

  constructor(data: IAuth0UserSettings) {
    this.id = data.id;
    if (data.infos) {
      this.infos = {
        loginsCount: data.infos.loginsCount,
        isConnected: data.infos.isConnected,
        lastLogin: data.infos.lastLogin,
      };
    }
  }

  get rawData(): IAuth0UserSettings {
    return {
      id: this.id,
      infos: this.infos,
    };
  }
}

export class User implements IUser {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  roles: Array<EUserRole>;
  createdAt: Date;
  updatedAt: Date;
  companyId: string;
  emailVerified: boolean;
  trainxSettings: TrainxUserSettings;
  recordxSettings: RecordxUserSettings;
  auth0Settings: Auth0UserSettings;

  constructor(data: IUser) {
    this.id = data.id ?? '';
    this.firstname = data.firstname ?? '';
    this.lastname = data.lastname ?? '';
    this.email = data.email ?? '';
    this.roles = data.roles ?? [];
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
    this.companyId = data.companyId ?? '';
    this.emailVerified = data.emailVerified ?? false;

    this.trainxSettings = new TrainxUserSettings({
      deletedAt: data.trainxSettings?.deletedAt,
      isConnectorActive: data.trainxSettings?.isConnectorActive ?? false,
      hasLicense: data.trainxSettings?.hasLicense ?? false,
    });

    this.recordxSettings = new RecordxUserSettings({
      hasLicense: data.recordxSettings?.hasLicense,
    });

    this.auth0Settings = new Auth0UserSettings({
      id: data.auth0Settings?.id ?? '',
      infos: data.auth0Settings?.infos
        ? {
            loginsCount: data.auth0Settings.infos.loginsCount,
            isConnected: data.auth0Settings.infos.isConnected,
            lastLogin: data.auth0Settings.infos.lastLogin,
          }
        : undefined,
    });
  }

  static fromDtos(theOfficeData: TheOfficeUserDtoApi, trainxData?: TrainXUserDto, auth0Data?: any): User {
    return new User({
      id: theOfficeData.id,
      firstname: theOfficeData.firstname,
      lastname: theOfficeData.lastname,
      email: theOfficeData.email,
      roles: theOfficeData.roles
        .map((role) => {
          switch (role) {
            case UserDtoApiRolesEnumApi.TrainxLead:
              return EUserRole.TrainxLead;
            case UserDtoApiRolesEnumApi.TrainxUser:
              return EUserRole.TrainxUser;
            case UserDtoApiRolesEnumApi.RecordxUser:
              return EUserRole.RecordxUser;
            case UserDtoApiRolesEnumApi.RecordxLead:
              return EUserRole.RecordxLead;
            case UserDtoApiRolesEnumApi.AltoAdmin:
              return EUserRole.AltoAdmin;
            case UserDtoApiRolesEnumApi.BillingAdmin:
              return EUserRole.BillingAdmin;
            default:
              return null;
          }
        })
        .filter((r) => !!r) as EUserRole[],
      createdAt: theOfficeData.createdAt,
      updatedAt: theOfficeData.updatedAt,
      companyId: theOfficeData.companyId,
      emailVerified: theOfficeData.emailVerified,
      trainxSettings: {
        deletedAt: trainxData?.deletedAt,
        isConnectorActive: trainxData?.isConnectorActive,
        hasLicense: theOfficeData.licenses.includes(environment.trainxTheOfficeId),
      },
      recordxSettings: {
        hasLicense: theOfficeData.licenses.includes(environment.recordxTheOfficeId),
      },
      auth0Settings: {
        id: theOfficeData.auth0Id,
        infos: auth0Data
          ? {
              loginsCount: auth0Data.logins_count,
              isConnected: true,
              lastLogin: auth0Data.last_login,
            }
          : undefined,
      },
    });
  }

  static getRoleList(): string[] {
    return Object.values(EUserRole);
  }

  static mapRoles(roles: string[]): EUserRole[] {
    return roles.map((role) => role as EUserRole);
  }

  static getRoleColor(role: string): string {
    switch (role) {
      case EUserRole.TrainxLead:
        return '#7792E6';
      case EUserRole.TrainxUser:
        return '#7FBEE6';
      case EUserRole.RecordxLead:
        return '#849B89';
      case EUserRole.RecordxUser:
        return '#91979A';
      case EUserRole.AltoAdmin:
        return '#E58460';
      case EUserRole.BillingAdmin:
        return '#E6BB63';
      default:
        return '#344054';
    }
  }

  get fullname(): string {
    return `${this.firstname} ${this.lastname}`;
  }

  get rawData(): IUser {
    return {
      id: this.id,
      firstname: this.firstname,
      lastname: this.lastname,
      email: this.email,
      roles: this.roles,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      companyId: this.companyId,
      emailVerified: this.emailVerified,
      trainxSettings: this.trainxSettings.rawData,
      recordxSettings: this.recordxSettings.rawData,
      auth0Settings: this.auth0Settings?.rawData,
    };
  }

  isAltoAdmin(): boolean {
    return this.roles.includes(EUserRole.AltoAdmin);
  }

  isTrainxLead(): boolean {
    return this.roles.includes(EUserRole.TrainxLead);
  }

  isTrainxUser(): boolean {
    return this.roles.includes(EUserRole.TrainxUser);
  }

  isRecordxLead(): boolean {
    return this.roles.includes(EUserRole.RecordxLead);
  }

  isRecordxUser(): boolean {
    return this.roles.includes(EUserRole.RecordxUser);
  }

  isBillingAdmin(): boolean {
    return this.roles.includes(EUserRole.BillingAdmin);
  }

  hasTrainxAccess(): boolean {
    return this.isTrainxLead() || this.isTrainxUser();
  }

  hasRecordxAccess(): boolean {
    return this.isRecordxLead() || this.isRecordxUser();
  }

  hasTrainxLicense(): boolean {
    return this.trainxSettings.hasLicense;
  }

  hasRecordxLicense(): boolean {
    return this.recordxSettings.hasLicense;
  }
}
