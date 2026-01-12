import * as Sentry from "@sentry/node";
import { logger } from "../utils/logger";

/**
 * Sentry Error Tracking Configuration
 *
 * Features:
 * - Real-time error monitoring
 * - Performance tracing (optional)
 * - Automatic PII scrubbing
 * - Environment-aware configuration
 */

export function initializeSentry(): void {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    logger.warn("SENTRY_DSN not configured - error tracking disabled");
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || "development",
    release: process.env.npm_package_version || "1.0.0",

    // Sample rate for performance monitoring (0.0 to 1.0)
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Sample rate for error events
    sampleRate: 1.0,

    // Integrations
    integrations: [
      // HTTP request tracking
      Sentry.httpIntegration(),
      // Express middleware integration (handles request/response tracing)
      Sentry.expressIntegration(),
      // Postgres query tracking
      Sentry.postgresIntegration(),
    ],

    // Before sending - scrub PII
    beforeSend(event) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers["authorization"];
        delete event.request.headers["cookie"];
        delete event.request.headers["x-api-key"];
      }

      // Remove sensitive data from breadcrumbs
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map(crumb => {
          if (crumb.data) {
            const scrubbed = { ...crumb.data };
            delete scrubbed.password;
            delete scrubbed.token;
            delete scrubbed.email;
            delete scrubbed.authorization;
            crumb.data = scrubbed;
          }
          return crumb;
        });
      }

      // Scrub user PII but keep ID for debugging
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
      // User-facing validation errors
      "ZodError",
      // Rate limiting (not an error)
      "TooManyRequestsError",
    ],

    // Custom tags for filtering
    initialScope: {
      tags: {
        service: "skaidrus-seimas",
      },
    },
  });

  logger.info("Sentry error tracking initialized");
}

/**
 * Capture exception with additional context
 */
export function captureException(
  error: Error,
  context?: Record<string, any>
): string {
  const eventId = Sentry.captureException(error, {
    extra: context,
  });

  logger.error(
    {
      err: error,
      sentryEventId: eventId,
      ...context,
    },
    "Exception captured"
  );

  return eventId;
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
 * Express error handler middleware
 * Must be added AFTER all routes
 */
export function sentryErrorHandler() {
  return Sentry.expressErrorHandler();
}

/**
 * Express request handler middleware
 * Must be added BEFORE all routes
 * Note: expressIntegration() is already configured in Sentry.init()
 * This is just a placeholder for consistency - the integration handles it automatically
 */
export function sentryRequestHandler() {
  // The expressIntegration() in Sentry.init() automatically handles request tracing
  // We don't need to return middleware here, but we keep the function for API consistency
  return (req: any, res: any, next: any) => {
    // Set request ID in Sentry scope if available
    const requestId = req.headers["x-request-id"] || (req as any).requestId;
    if (requestId) {
      Sentry.setTag("request_id", requestId);
    }
    next();
  };
}

/**
 * Graceful shutdown
 */
export async function closeSentry(): Promise<void> {
  await Sentry.close(2000);
  logger.info("Sentry closed");
}

export { Sentry };
