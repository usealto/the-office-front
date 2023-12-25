/// <reference types="@angular/localize" />

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { bugLoggerConfig } from './app/core/utils/buglogger.config';

bugLoggerConfig();

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
