import pino from "pino";

/**
 * Structured Logger using Pino
 *
 * Features:
 * - JSON structured logging for production (machine-readable)
 * - Pretty printing for development (human-readable)
 * - Automatic PII redaction
 * - Request correlation IDs
 * - Low overhead (~10x faster than Winston/Bunyan)
 */

const isDev = process.env.NODE_ENV !== "production";

// PII fields to automatically redact
const redactPaths = [
  "email",
  "password",
  "token",
  "authorization",
  "cookie",
  "req.headers.authorization",
  "req.headers.cookie",
  'res.headers["set-cookie"]',
  "*.password",
  "*.email",
  "*.token",
];

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? "debug" : "info"),

  // Redact sensitive data
  redact: {
    paths: redactPaths,
    censor: "[REDACTED]",
  },

  // Base context added to all logs
  base: {
    service: "skaidrus-seimas",
    env: process.env.NODE_ENV || "development",
  },

  // Timestamp format
  timestamp: pino.stdTimeFunctions.isoTime,

  // Pretty print in development
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname,service,env",
        },
      }
    : undefined,

  // Serializers for common objects
  serializers: {
    req: req => ({
      method: req.method,
      url: req.url,
      path: req.path,
      query: req.query,
      params: req.params,
      headers: {
        "user-agent": req.headers?.["user-agent"],
        "content-type": req.headers?.["content-type"],
        "x-request-id": req.headers?.["x-request-id"],
      },
    }),
    res: res => ({
      statusCode: res.statusCode,
    }),
    err: pino.stdSerializers.err,
  },
});

/**
 * Create a child logger with request context
 */
export function createRequestLogger(requestId: string) {
  return logger.child({ requestId });
}

/**
 * Express middleware for request logging
 */
export function requestLogger() {
  return (req: any, res: any, next: any) => {
    const requestId = req.headers["x-request-id"] || crypto.randomUUID();
    const startTime = Date.now();

    // Attach logger to request
    req.log = logger.child({ requestId });

    // Log request start
    req.log.info({ req }, "Incoming request");

    // Log response on finish
    res.on("finish", () => {
      const duration = Date.now() - startTime;
      const level = res.statusCode >= 400 ? "warn" : "info";

      req.log[level](
        {
          res,
          duration: `${duration}ms`,
        },
        `Request completed ${res.statusCode}`
      );
    });

    next();
  };
}

export default logger;
