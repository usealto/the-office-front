import * as Sentry from "@sentry/angular-ivy";
import { environment } from "src/environments/environment";

export const bugLoggerConfig = (): void => {
  const bugLoggerId = environment.bugLoggerId;
  if (!bugLoggerId) {    console.log('bugLoggerId is not defined'); return;  }
  Sentry.init({
    dsn: bugLoggerId,
    integrations: [
      // Registers and configures the Tracing integration,
      // which automatically instruments your application to monitor its
      // performance, including custom Angular routing instrumentation
      new Sentry.BrowserTracing({
        routingInstrumentation: Sentry.routingInstrumentation,
      }),
      // Registers the Replay integration,
      // which automatically captures Session Replays
      new Sentry.Replay(),
    ],
    environment: environment.environment,
    // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: ["localhost", /^https:\/\/.*usealto*/, /^https:\/\/.*getcockpit*/],
    replaysSessionSampleRate: 0.1, // Capture Replay for 10% of all sessions,
    replaysOnErrorSampleRate: 1.0, // plus for 100% of sessions with an error
  }); 
};


