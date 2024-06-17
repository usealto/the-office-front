import { CoachDtoApi as TrainXUserDto } from '@usealto/sdk-ts-angular';
import { UserDtoApi as TheOfficeUserDtoApi, UserDtoApiRolesEnumApi } from '@usealto/the-office-sdk-angular';
import { environment } from '../../../environments/environment';

export interface ICoach {
  id: string;
  name: string;
  pictureUrl: string;
}

export class Coach implements ICoach {
  id: string;
  name: string;
  pictureUrl: string;

  constructor(data: ICoach) {
    this.id = data.id ?? '';
    this.name = data.name ?? '';
    this.pictureUrl = data.pictureUrl ?? '';
  }

  static fromDtos(trainxData?: TrainXUserDto, auth0Data?: any): User {
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
      applicationIds: theOfficeData.applicationIds,
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
      applicationIds: this.applicationIds,
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

  hasApplicationId(applicationId: string): boolean {
    return this.applicationIds.includes(applicationId);
  }
}
