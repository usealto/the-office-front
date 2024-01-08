import { ApplicationDtoApi } from "@usealto/the-office-sdk-angular";

export interface IApplication {
  id: string;
  name: string;
  url: string;
}

export class Application implements IApplication {
  id: string;
  name: string;
  url: string;

  constructor(data: IApplication) {
    this.id = data.id;
    this.name = data.name;
    this.url = data.url;
  }

  static fromDto(data: ApplicationDtoApi): Application {
    return new Application({
      id: data.id,
      name: data.name,
      url: data.url,
    });
  }

  get rawData(): IApplication {
    return {
      id: this.id,
      name: this.name,
      url: this.url,
    };
  }
}