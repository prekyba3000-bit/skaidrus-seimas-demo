import "dotenv/config";
import express from "express";
import { createServer, Server } from "http";
import net from "net";
import path from "path";
import { randomUUID } from "crypto";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { requestLogger, logger } from "../utils/logger";
import {
  initializeSentry,
  sentryRequestHandler,
  sentryErrorHandler,
} from "../services/sentry";
import { closeDatabase } from "../services/database";
import { cache } from "../services/cache";
import { closeRedisConnection } from "../lib/redis";
import { ENV } from "./env";

// Validate critical environment variables at startup
function validateEnvironmentVariables() {
  const missing: string[] = [];

  if (!process.env.DATABASE_URL) {
    missing.push("DATABASE_URL");
  }

  if (!ENV.appId) {
    missing.push("VITE_APP_ID");
  }

  if (!ENV.cookieSecret) {
    missing.push("JWT_SECRET");
  }

  if (missing.length > 0) {
    logger.error(
      { missing },
      "Missing required environment variables. Please set them in Railway Variables."
    );
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. ` +
        "Please configure them in Railway Dashboard → Variables. " +
        "See RAILWAY_ENV_VARS.md for details."
    );
  }

  logger.info("Environment variables validated");
}

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

import {
  startScraperWorker,
  shutdownWorker as stopScraperWorker,
} from "../workers/scraper";
import {
  startVoteScraperWorker,
  shutdownWorker as stopVoteScraperWorker,
} from "../workers/vote-scraper";
import { Worker } from "bullmq";

// Global variables for graceful shutdown
let httpServer: Server | null = null;
let isShuttingDown = false;
let scraperWorker: Worker | null = null;
let voteScraperWorker: Worker | null = null;

/**
 * Graceful shutdown handler
 */
async function gracefulShutdown(signal: string) {
  if (isShuttingDown) {
    logger.warn("Shutdown already in progress");
    return;
  }

  isShuttingDown = true;
  logger.info(
    { signal },
    "Received shutdown signal, starting graceful shutdown"
  );

  // 1. Stop accepting new connections
  if (httpServer) {
    httpServer.close(() => {
      logger.info("HTTP server closed");
    });

    // Force close after 10 seconds
    setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10000);
  }

  // 2. Stop Workers
  try {
    if (scraperWorker) {
      await stopScraperWorker(scraperWorker);
    }
    if (voteScraperWorker) {
      await stopVoteScraperWorker(voteScraperWorker);
    }
    logger.info("Workers stopped");
  } catch (err) {
    logger.error({ err }, "Error stopping workers");
  }

  // 3. Close database connection pool
  try {
    await closeDatabase();
    logger.info("Database connection pool closed");
  } catch (err) {
    logger.error({ err }, "Error closing database connection");
  }

  // 4. Disconnect Redis (cache service)
  try {
    await cache.disconnect();
    logger.info("Redis cache disconnected");
  } catch (err) {
    logger.error({ err }, "Error disconnecting Redis cache");
  }

  // 5. Disconnect Redis (BullMQ)
  try {
    await closeRedisConnection();
    logger.info("Redis BullMQ connection closed");
  } catch (err) {
    logger.error({ err }, "Error closing Redis BullMQ connection");
  }

  logger.info("Graceful shutdown complete");
  process.exit(0);
}

async function startServer() {
  // Validate environment variables first
  validateEnvironmentVariables();

  // Initialize Sentry before anything else
  initializeSentry();

  const app = express();
  const server = createServer(app);

  // Trust proxy (for rate limiting behind reverse proxy)
  app.set("trust proxy", 1);

  // Security Headers: Helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for Tailwind
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"], // Allow images from any HTTPS source
          connectSrc: ["'self'"],
          fontSrc: ["'self'", "data:"],
        },
      },
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      hidePoweredBy: true,
      xssFilter: true,
      noSniff: true,
      frameguard: { action: "deny" },
    })
  );

  // CORS Configuration
  const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map(url => url.trim())
    : process.env.NODE_ENV === "production"
      ? []
      : ["http://localhost:5173", "http://localhost:3000"]; // Dev fallback

  app.use(
    cors({
      origin: (
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void
      ) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) {
          return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          logger.warn({ origin, allowedOrigins }, "CORS blocked request");
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "x-request-id"],
      exposedHeaders: ["x-request-id"],
    })
  );

  // Global Rate Limiting (applied to all routes except health checks)
  const globalRateLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000"), // 1 minute
    max: parseInt(process.env.RATE_LIMIT_MAX || "100"), // 100 requests per window
    message: {
      error: "Too Many Requests",
      message: "Rate limit exceeded. Please try again later.",
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    skip: req => {
      // Skip rate limiting for health checks
      return req.path === "/health" || req.path === "/health/ready";
    },
  });

  app.use(globalRateLimiter);

  // Strict Rate Limiting for sensitive endpoints
  const strictRateLimiter = rateLimit({
    windowMs: parseInt(process.env.STRICT_RATE_LIMIT_WINDOW_MS || "60000"), // 1 minute
    max: parseInt(process.env.STRICT_RATE_LIMIT_MAX || "5"), // 5 requests per window
    message: {
      error: "Too Many Requests",
      message: "Rate limit exceeded for this endpoint. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Apply strict rate limiting to sensitive tRPC endpoints
  // tRPC routes are accessed via query params, so we need to check the path and query
  app.use("/api/trpc", (req, res, next) => {
    // Check if this is a sensitive endpoint
    const url = req.url || "";
    const isSensitiveEndpoint =
      url.includes("auth.login") || url.includes("user.updateSettings");

    if (isSensitiveEndpoint) {
      return strictRateLimiter(req, res, next);
    }
    next();
  });

  // Sentry request handler must be first (for tracing and request ID tagging)
  app.use(sentryRequestHandler());

  // Request ID middleware - must be early in the chain
  app.use((req, res, next) => {
    // Generate or use existing request ID from header
    const requestId = (req.headers["x-request-id"] as string) || randomUUID();

    // Attach to request for use in context
    (req as any).requestId = requestId;

    // Set response header so frontend can correlate errors
    res.setHeader("x-request-id", requestId);

    next();
  });

  // Structured request logging middleware
  app.use(requestLogger());

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Health check endpoints (excluded from rate limiting via skip function)
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Deep health check (readiness probe)
  app.get("/health/ready", async (_req, res) => {
    const checks: Record<
      string,
      { status: string; latencyMs?: number; error?: string }
    > = {};

    // Check database
    try {
      const { healthCheck } = await import("../services/database");
      const dbHealth = await healthCheck();
      checks.database = {
        status: dbHealth.status,
        latencyMs: dbHealth.latencyMs,
      };
    } catch (err: unknown) {
      checks.database = {
        status: "unhealthy",
        error: err instanceof Error ? err.message : String(err),
      };
    }

    // Check Redis
    try {
      const start = performance.now();
      const redisHealthy = await cache.ping();
      const latencyMs = Math.round(performance.now() - start);
      checks.redis = {
        status: redisHealthy ? "healthy" : "unhealthy",
        latencyMs,
      };
    } catch (err: unknown) {
      checks.redis = {
        status: "unhealthy",
        error: err instanceof Error ? err.message : String(err),
      };
    }

    // Determine overall status
    const allHealthy = Object.values(checks).every(
      check => check.status === "healthy"
    );

    const statusCode = allHealthy ? 200 : 503;
    res.status(statusCode).json({
      status: allHealthy ? "ready" : "not ready",
      checks,
      timestamp: new Date().toISOString(),
    });
  });

  // Browser test endpoint - verifies Playwright is working in Docker
  app.get("/test-browser", async (_req, res) => {
    const { launchBrowser, createBrowserContext } = await import(
      "../utils/playwright"
    );
    let browser;
    try {
      browser = await launchBrowser();
      const context = await createBrowserContext(browser);
      const page = await context.newPage();

      await page.goto("https://google.com", {
        waitUntil: "networkidle",
        timeout: 30000,
      });

      const title = await page.title();

      await browser.close();

      res.json({
        success: true,
        title,
        message: "Playwright browser test successful",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      if (browser) {
        await browser.close().catch(() => {
          // Ignore cleanup errors
        });
      }
      logger.error({ err: error }, "Browser test failed");
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "Playwright browser test failed",
        timestamp: new Date().toISOString(),
      });
    }
  });

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // tRPC API with error handling
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
      onError: ({ path, error, type, ctx, input }) => {
        // Use context logger if available, otherwise create one
        const log = ctx?.log || require("../utils/logger").logger;
        const requestId =
          ctx?.requestId || (ctx?.req as any)?.requestId || "unknown";
        const userId = ctx?.user?.openId || "anonymous";

        // Log error with full context using structured logger
        log.error(
          {
            err: error,
            path,
            type,
            requestId,
            userId,
            input: input ? JSON.stringify(input) : undefined,
            code: error.code,
            message: error.message,
            stack: error.stack,
          },
          `tRPC error: ${error.message}`
        );

        // Send to Sentry if configured
        if (process.env.SENTRY_DSN) {
          const { captureException, setUser } = require("../services/sentry");
          if (ctx?.user) {
            setUser({ id: ctx.user.openId, role: ctx.user.role || undefined });
          }
          // Set request ID as tag for correlation
          require("@sentry/node").setTag("request_id", requestId);
          captureException(error, {
            requestId,
            path,
            type,
            userId,
            input: input ? JSON.stringify(input) : undefined,
          });
        }
      },
    })
  );

  // Sentry error handler must be after all routes
  app.use(sentryErrorHandler());

  // Serve API documentation
  app.use("/docs", express.static("docs"));

  // Serve static files from client/dist (React app build)
  // Set proper headers for static assets
  // IMPORTANT: This must come BEFORE the catch-all route
  // Express processes middleware in order, so static files are served first
  // Use absolute path to ensure correct resolution in Docker container
  const staticPath = path.join(process.cwd(), "client/dist");
  logger.info({ staticPath }, "Serving static files from");
  
  app.use(
    express.static(staticPath, {
      maxAge: "1y", // Cache static assets for 1 year
      etag: true,
      lastModified: true,
      setHeaders: (res, filePath) => {
        // Set proper Content-Type for JS and CSS files
        if (filePath.endsWith(".js")) {
          res.setHeader("Content-Type", "application/javascript; charset=utf-8");
        } else if (filePath.endsWith(".css")) {
          res.setHeader("Content-Type", "text/css; charset=utf-8");
        }
      },
    })
  );

  // API info endpoint (only for /api/info to avoid conflicting with SPA routing)
  app.get("/api/info", (_req, res) => {
    res.json({
      name: "Skaidrus Seimas API",
      version: "1.0.0",
      documentation: "/docs/swagger-ui.html",
      openapi: "/docs/openapi.yaml",
      endpoints: {
        trpc: "/api/trpc",
        health: "/health",
        oauth: "/api/oauth/*",
        docs: "/docs",
      },
    });
  });

  // Diagnostic test page (for debugging blank screen issues)
  app.get("/test", (_req, res) => {
    res.sendFile(path.join(process.cwd(), "client/dist/test.html"), err => {
      if (err) {
        logger.error({ err }, "Failed to serve test.html");
        res.status(404).json({ error: "Test page not found" });
      }
    });
  });

  // SPA fallback: serve index.html for all non-API routes
  // This must be last so API routes take precedence
  // IMPORTANT: express.static middleware above handles static files first
  // If express.static doesn't find a file, it will call next() and this route handles it
  app.get("*", (req, res, next) => {
    // Skip if this is an API route
    if (req.path.startsWith("/api") || req.path.startsWith("/docs")) {
      return next();
    }
    
    // Check if this is a static asset path
    const isStaticAsset =
      req.path.startsWith("/js/") ||
      req.path.startsWith("/assets/") ||
      /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|map)$/i.test(req.path);
    
    if (isStaticAsset) {
      // Static file not found by express.static - log and return 404
      logger.warn({ path: req.path, staticPath }, "Static file not found");
      return res.status(404).json({ 
        error: "Static file not found", 
        path: req.path,
        message: "The requested static asset does not exist. This may indicate a build issue."
      });
    }
    
    // Serve the React app's index.html for client-side routing
    const indexPath = path.join(process.cwd(), "client/dist/index.html");
    res.sendFile(indexPath, err => {
      if (err) {
        logger.error({ err, path: req.path, indexPath }, "Failed to serve index.html");
        res.status(404).json({ error: "Not found" });
      }
    });
  });

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    logger.warn(
      { preferredPort, actualPort: port },
      "Port busy, using alternative"
    );
  }

  // Initialize Redis cache connection
  try {
    await cache.connect();
  } catch (err) {
    logger.warn(
      { err },
      "Redis cache initialization failed - continuing without cache"
    );
  }

  // Start Workers
  try {
    scraperWorker = startScraperWorker();
    voteScraperWorker = startVoteScraperWorker();
    logger.info("Background workers started");
  } catch (err) {
    logger.error({ err }, "Failed to start background workers");
  }

  httpServer = server.listen(port, () => {
    logger.info({ port }, "Skaidrus Seimas API server started");
    logger.info(
      { health: "/health", ready: "/health/ready" },
      "Health check endpoints available"
    );
  });

  // Graceful shutdown handlers
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  // Handle uncaught errors
  process.on("uncaughtException", err => {
    logger.error({ err }, "Uncaught exception");
    gracefulShutdown("uncaughtException");
  });

  process.on("unhandledRejection", (reason, promise) => {
    logger.error({ reason, promise }, "Unhandled rejection");
    // Don't shutdown on unhandled rejection, just log it
  });
}

startServer().catch(err => {
  logger.error({ err }, "Fatal error starting server");
  process.exit(1);
});
