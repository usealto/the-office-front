import { CompanyDtoApi as TrainxCompanyDtoApi } from '@usealto/sdk-ts-angular';
import { CompanyDtoApi as theOfficeCompanyDtoApi } from '@usealto/the-office-sdk-angular';
import { environment } from '../../../environments/environment';
import { EUserRole, IUser, User } from './user.model';

export interface IStripeSettings {
  stripeId?: string;
  billingAdmin?: IUser;
}

export class StripeSettings implements IStripeSettings {
  stripeId?: string;
  billingAdmin?: User;

  constructor(data: IStripeSettings) {
    this.stripeId = data.stripeId;
    this.billingAdmin = data.billingAdmin ? new User(data.billingAdmin) : undefined;
  }

  get rawData(): IStripeSettings {
    return {
      stripeId: this.stripeId,
      billingAdmin: this.billingAdmin,
    };
  }
}

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

  get rawData(): ITrainxCompanySettings {
    return {
      licenseCount: this.licenseCount,
    };
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

  static fromDto(data: TrainxCompanyDtoApi): RecordxCompanySettings {
    return new RecordxCompanySettings({
      licenseCount: data.licenseCount,
    });
  }

  get rawData(): IRecordxCompanySettings {
    return {
      licenseCount: this.licenseCount,
    };
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
  trainxSettings: ITrainxCompanySettings;
  recordxSettings: IRecordxCompanySettings;
  stripeSettings: IStripeSettings;
}

export class Company implements ICompany {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  createdBy?: string;
  users: User[];
  usersById: Map<string, User>;
  trainxSettings: TrainxCompanySettings;
  recordxSettings: RecordxCompanySettings;
  stripeSettings: StripeSettings;

  constructor(data: ICompany) {
    this.id = data.id;
    this.name = data.name;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.deletedAt = data.deletedAt;
    this.createdBy = data.createdBy;
    this.users = data.users.map((u) => new User(u));
    this.usersById = new Map(this.users.map((u) => [u.id, u]));
    this.trainxSettings = new TrainxCompanySettings(data.trainxSettings);
    this.recordxSettings = new RecordxCompanySettings(data.recordxSettings);
    this.stripeSettings = new StripeSettings({
      stripeId: data.stripeSettings.stripeId,
      billingAdmin: data.users.find((u) => u.roles.some((r) => r === EUserRole.BillingAdmin)),
    });
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
      trainxSettings: new TrainxCompanySettings({
        licenseCount:
          theofficeData.licenses.find((l) => l.applicationId === environment.trainxTheOfficeId)?.quantity ??
          0,
      }),
      recordxSettings: new RecordxCompanySettings({
        licenseCount:
          theofficeData.licenses.find((l) => l.applicationId === environment.recordxTheOfficeId)?.quantity ??
          0,
      }),
      stripeSettings: new StripeSettings({
        stripeId: theofficeData.stripeId,
      }),
    });
  }

  getUserById(id: string): User | undefined {
    return this.usersById.get(id);
  }

  addUser(user: User): void {
    this.usersById.set(user.id, user);
    if (user.roles.some((role) => role === EUserRole.BillingAdmin)) {
      const oldBillingAdmin = this.billingAdmin;
      if (oldBillingAdmin) {
        this.usersById.set(
          oldBillingAdmin.id,
          new User({
            ...oldBillingAdmin.rawData,
            roles: oldBillingAdmin.roles.filter((r) => r !== EUserRole.BillingAdmin),
          }),
        );
      }

      this.users = [...this.usersById.values()];
      this.setBillingAdmin(user);
    }
  }

  setBillingAdmin(user: User): void {
    this.stripeSettings.billingAdmin = user;
  }

  get billingAdmin(): User | undefined {
    return this.stripeSettings.billingAdmin;
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
      trainxSettings: this.trainxSettings.rawData,
      recordxSettings: this.recordxSettings.rawData,
      stripeSettings: this.stripeSettings.rawData,
    };
  }
}
