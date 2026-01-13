/**
 * Frontend Monitoring & Error Tracking
 *
 * Initializes Sentry for React error tracking
 * Only initializes if SENTRY_DSN is configured
 */

import * as Sentry from "@sentry/react";

/**
 * Initialize Sentry for frontend error tracking
 */
export function initializeSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) {
    // Silently skip if DSN not configured (local dev)
    if (import.meta.env.DEV) {
      console.debug(
        "[Sentry] VITE_SENTRY_DSN not configured - error tracking disabled"
      );
    }
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE || "development",
    release: import.meta.env.VITE_APP_VERSION || "1.0.0",

    // Sample rate for performance monitoring
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,

    // Sample rate for error events
    sampleRate: 1.0,

    // Integrations
    integrations: [
      // Browser tracing
      Sentry.browserTracingIntegration(),
      // Capture console errors
      Sentry.captureConsoleIntegration({
        levels: ["error"],
      }),
    ],

    // Before sending - scrub PII
    beforeSend(event) {
      // Remove sensitive data from request headers
      if (event.request?.headers) {
        delete event.request.headers["authorization"];
        delete event.request.headers["cookie"];
      }

      // Scrub user PII but keep ID
      if (event.user) {
        event.user = {
          id: event.user.id,
          // Remove email, username, ip_address
        };
      }

      return event;
    },

    // Ignore specific errors
    ignoreErrors: [
      // Network errors that are expected
      "Network request failed",
      "Failed to fetch",
      "Load failed",
      "NetworkError",
      // Browser extensions
      "Non-Error promise rejection captured",
      // User-facing validation errors
      "ZodError",
    ],

    // Custom tags
    initialScope: {
      tags: {
        service: "skaidrus-seimas-frontend",
      },
    },
  });

  console.info("[Sentry] Frontend error tracking initialized");
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id: string; role?: string }): void {
  Sentry.setUser({
    id: user.id,
    // Intentionally not sending email/username for privacy
  });

  if (user.role) {
    Sentry.setTag("user_role", user.role);
  }
}

/**
 * Clear user context (on logout)
 */
export function clearUser(): void {
  Sentry.setUser(null);
}

/**
 * Capture exception with additional context
 */
export function captureException(
  error: Error,
  context?: Record<string, any>
): string | undefined {
  const eventId = Sentry.captureException(error, {
    extra: context,
  });

  console.error("[Sentry] Exception captured:", eventId, error, context);

  return eventId;
}

export { Sentry };
