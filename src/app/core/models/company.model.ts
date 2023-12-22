import { CompanyDtoApi as TrainxCompanyDtoApi } from '@usealto/sdk-ts-angular';
import { CompanyDtoApi as theOfficeCompanyDtoApi } from '@usealto/the-office-sdk-angular';
import { IUser, User } from './user.model';
import { environment } from '../../../environments/environment';

export interface ITrainxCompanySettings {
  licenseCount: number;
}

export class TrainxCompanySettings implements ITrainxCompanySettings {
  licenseCount: number;

  constructor(data: ITrainxCompanySettings) {
    this.licenseCount = data.licenseCount;
  }

  static fromDto(data: TrainxCompanyDtoApi): TrainxCompanySettings {
    return new TrainxCompanySettings({
      licenseCount: data.licenseCount,
    });
  }
}

export interface IRecordxCompanySettings {
  licenseCount: number;
}

export class RecordxCompanySettings implements IRecordxCompanySettings {
  licenseCount: number;

  constructor(data: IRecordxCompanySettings) {
    this.licenseCount = data.licenseCount;
  }
}

export interface ICompany {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  createdBy?: string;
  users: IUser[];
  stripeId?: string;
  trainxSettings: ITrainxCompanySettings;
  recordxSettings: IRecordxCompanySettings;
}

export class Company implements ICompany {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  createdBy?: string;
  users: User[];
  stripeId?: string;
  trainxSettings: TrainxCompanySettings;
  recordxSettings: RecordxCompanySettings;

  constructor(data: ICompany) {
    this.id = data.id;
    this.name = data.name;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.deletedAt = data.deletedAt;
    this.createdBy = data.createdBy;
    this.users = data.users.map((u) => new User(u));
    this.stripeId = data.stripeId;
    this.trainxSettings = new TrainxCompanySettings(data.trainxSettings);
    this.recordxSettings = new RecordxCompanySettings(data.recordxSettings);
  }

  static fromDto(theofficeData: theOfficeCompanyDtoApi): Company {
    return new Company({
      id: theofficeData.id,
      name: theofficeData.name,
      createdAt: theofficeData.createdAt,
      updatedAt: theofficeData.updatedAt,
      deletedAt: theofficeData.deletedAt,
      createdBy: theofficeData.createdByUser
        ? theofficeData.createdByUser.firstname + ' ' + theofficeData.createdByUser.lastname
        : undefined,
      users: [],
      stripeId: theofficeData.stripeId,
      trainxSettings: {
        licenseCount:
          theofficeData.licenses.find((l) => l.applicationId === environment.trainxTheOfficeId)?.quantity ??
          0,
      },
      recordxSettings: {
        licenseCount:
          theofficeData.licenses.find((l) => l.applicationId === environment.recordxTheOfficeId)?.quantity ??
          0,
      },
    });
  }

  get rawData(): ICompany {
    return {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
      createdBy: this.createdBy,
      users: this.users.map((u) => u.rawData),
      stripeId: this.stripeId,
      trainxSettings: this.trainxSettings,
      recordxSettings: this.recordxSettings,
    };
  }
}
