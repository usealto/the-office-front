import { UserDtoApi as TrainXUserDto } from '@usealto/sdk-ts-angular';
import { UserDtoApi as TheOfficeUserDtoApi, UserDtoApiRolesEnumApi } from '@usealto/the-office-sdk-angular';
import { environment } from '../../../environments/environment';

export interface IUser {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  roles: Array<UserDtoApiRolesEnumApi>;
  createdAt: Date;
  updatedAt: Date;
  companyId: string;
  trainxSettings: ITrainxUserSettings;
  recordxSettings: IRecordxUserSettings;
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

export class User implements IUser {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  roles: Array<UserDtoApiRolesEnumApi>;
  createdAt: Date;
  updatedAt: Date;
  companyId: string;
  trainxSettings: TrainxUserSettings;
  recordxSettings: RecordxUserSettings;

  constructor(data: IUser) {
    this.id = data.id ?? '';
    this.firstname = data.firstname ?? '';
    this.lastname = data.lastname ?? '';
    this.email = data.email ?? '';
    this.roles = data.roles ?? [];
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
    this.companyId = data.companyId ?? '';

    this.trainxSettings = new TrainxUserSettings({
      deletedAt: data.trainxSettings?.deletedAt,
      isConnectorActive: data.trainxSettings?.isConnectorActive ?? false,
      hasLicense: data.trainxSettings?.hasLicense ?? false,
    });

    this.recordxSettings = new RecordxUserSettings({
      hasLicense: data.recordxSettings?.hasLicense,
    });
  }

  static fromDtos(theOfficeData: TheOfficeUserDtoApi, trainxData?: TrainXUserDto): User {
    return new User({
      id: theOfficeData.id,
      firstname: theOfficeData.firstname,
      lastname: theOfficeData.lastname,
      email: theOfficeData.email,
      roles: theOfficeData.roles,
      createdAt: theOfficeData.createdAt,
      updatedAt: theOfficeData.updatedAt,
      companyId: theOfficeData.companyId,
      trainxSettings: {
        deletedAt: trainxData?.deletedAt,
        isConnectorActive: trainxData?.isConnectorActive,
        hasLicense: theOfficeData.licenses.includes(environment.trainxTheOfficeId),
      },
      recordxSettings: {
        hasLicense: theOfficeData.licenses.includes(environment.recordxTheOfficeId),
      },
    });
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
      trainxSettings: this.trainxSettings.rawData,
      recordxSettings: this.recordxSettings.rawData,
    };
  }

  isAltoAdmin(): boolean {
    return this.roles.includes(UserDtoApiRolesEnumApi.AltoAdmin);
  }

  isTrainxLead(): boolean {
    return this.roles.includes(UserDtoApiRolesEnumApi.TrainxLead);
  }

  isTrainxUser(): boolean {
    return this.roles.includes(UserDtoApiRolesEnumApi.TrainxUser);
  }

  isRecordxLead(): boolean {
    return this.roles.includes(UserDtoApiRolesEnumApi.RecordxLead);
  }

  isRecordxUser(): boolean {
    return this.roles.includes(UserDtoApiRolesEnumApi.RecordxUser);
  }

  isBillingAdmin(): boolean {
    return this.roles.includes(UserDtoApiRolesEnumApi.BillingAdmin);
  }
}
