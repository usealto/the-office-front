// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  trainxapiURL: 'http://localhost:3000',
  auth0Domain: 'dev-bmttww5s.eu.auth0.com',
  auth0ClientId: 'ThcIBQZrRso5QaZq67kCU5eFYTfZwTSK',
  audience: 'https://api.usealto.com',
  theofficeURL: 'http://localhost:3001',
  // audience: 'https://dev-bmttww5s.eu.auth0.com/api/v2',
  trainxTheOfficeId: '5de36fd6-36c0-49ac-97bc-9e0517527d1c',
  recordxTheOfficeId: '305fd64b-f9b7-46ae-a82f-1ca36be7088a',
  stripeCustomerURL: 'https://dashboard.stripe.com/test/customers/',
  auth0URL: 'https://manage.auth0.com/dashboard/eu/dev-bmttww5s/users/',
  sentryDsn: 'https://4c5db3174b7e575494d145068d5ecdda@o4506417447174144.ingest.sentry.io/4506558940971008',
  sentryTracesSampleRate: 1.0,
  sentryReplaysSessionSampleRate: 0,
  sentryReplaysOnErrorSampleRate: 1.0,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import 'zone.js/plugins/zone-error'; // Included with Angular CLI.
