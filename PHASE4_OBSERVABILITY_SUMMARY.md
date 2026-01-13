# Phase 4: Observability & Error Handling - Implementation Summary

## Overview

This document summarizes the observability improvements completed in Phase 4. All logs now include request correlation IDs, errors are properly tracked, and the frontend has a robust error boundary.

## Changes Made

### 1. Request ID (Correlation ID) Implementation

**File:** `server/_core/index.ts`

**Middleware Added:**

- Request ID middleware generates UUID for each request if not present in headers
- Sets `x-request-id` response header for frontend correlation
- Attaches `requestId` to request object for use in context

**Code:**

```typescript
// Request ID middleware - must be early in the chain
app.use((req, res, next) => {
  const requestId = (req.headers["x-request-id"] as string) || randomUUID();
  (req as any).requestId = requestId;
  res.setHeader("x-request-id", requestId);
  next();
});
```

**Benefits:**

- Every request has a unique correlation ID
- Frontend can see request ID in Network tab headers
- Backend logs can be correlated with frontend errors

### 2. Enhanced tRPC Context

**File:** `server/_core/context.ts`

**Changes:**

- Added `requestId` to `TrpcContext` type
- Added `log` (request-scoped logger) to context
- Logger automatically includes `requestId` and `userId` (if authenticated)

**Code:**

```typescript
export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  requestId: string;
  log: ReturnType<typeof createRequestLogger>;
};
```

**Benefits:**

- All tRPC procedures have access to request-scoped logger
- Logger automatically includes correlation context
- No need to manually pass requestId/userId to each log call

### 3. Structured Logging with Pino

**File:** `server/utils/logger.ts`

**Enhancements:**

- `createRequestLogger()` now accepts optional `userId` parameter
- All logs automatically include `requestId` and `userId` (if available)
- Request logger middleware updated to use requestId from middleware

**Code:**

```typescript
export function createRequestLogger(requestId: string, userId?: string) {
  const context: Record<string, string> = { requestId };
  if (userId) {
    context.userId = userId;
  }
  return logger.child(context);
}
```

**Benefits:**

- Consistent log format across all requests
- Easy filtering by requestId or userId
- Machine-readable JSON logs in production

### 4. tRPC Error Handling

**File:** `server/_core/index.ts`

**onError Callback:**

- Uses context logger (includes requestId and userId)
- Logs full error context: path, type, input, stack
- Sends errors to Sentry with correlation tags
- Sets user context in Sentry if authenticated

**Code:**

```typescript
onError: ({ path, error, type, ctx, input }) => {
  const log = ctx?.log || require("../utils/logger").logger;
  const requestId = ctx?.requestId || "unknown";
  const userId = ctx?.user?.openId || "anonymous";

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

  // Send to Sentry with correlation tags
  if (process.env.SENTRY_DSN) {
    Sentry.setTag("request_id", requestId);
    captureException(error, { requestId, path, type, userId, input });
  }
};
```

**Benefits:**

- All tRPC errors are logged with full context
- Errors automatically sent to Sentry for monitoring
- Request ID correlation for debugging

### 5. Backend Sentry Integration

**File:** `server/services/sentry.ts` (already existed, enhanced)

**Enhancements:**

- `sentryRequestHandler()` sets request ID as Sentry tag
- Error handler properly configured
- User context automatically set from tRPC context

**Initialization:**

- Called at server startup in `server/_core/index.ts`
- Only initializes if `SENTRY_DSN` environment variable is set
- Gracefully skips if not configured (local dev)

### 6. Frontend Sentry Setup

**File:** `client/src/monitoring.ts` (NEW)

**Features:**

- Initializes Sentry for React error tracking
- Only initializes if `VITE_SENTRY_DSN` is configured
- Gracefully handles missing `@sentry/react` package (local dev)
- PII scrubbing in `beforeSend` hook
- User context management

**Code:**

```typescript
export function initializeSentry(): void {
  if (!Sentry) return; // Skip if package not installed

  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return; // Skip if DSN not configured

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    // ... configuration
  });
}
```

**Initialization:**

- Called in `client/src/main.tsx` before app render
- Ensures errors are captured from the start

### 7. Enhanced Error Boundary

**File:** `client/src/components/ErrorBoundary.tsx`

**Enhancements:**

- Reports errors to Sentry automatically
- Displays friendly error UI (glassmorphism style)
- Shows error ID for support correlation
- Development mode: shows stack trace
- Production mode: hides technical details
- "Reload Page" and "Go Home" actions

**Features:**

- Catches React render errors
- Logs to console (always)
- Reports to Sentry (if configured)
- Displays user-friendly error message
- Shows error ID for support tickets
- Stack trace in dev mode only

**UI:**

- Professional glassmorphism design
- Matches app dark theme
- Clear error message
- Action buttons (Reload, Go Home)
- Error ID for support correlation

## Request Flow with Correlation

### Backend Flow:

1. Request arrives → Request ID middleware generates/reads UUID
2. Request ID set in response header (`x-request-id`)
3. Request ID attached to request object
4. tRPC context created with requestId and logger
5. Logger automatically includes requestId and userId in all logs
6. Errors logged with full context (requestId, userId, path, input)
7. Errors sent to Sentry with requestId tag

### Frontend Flow:

1. Request sent with optional `x-request-id` header
2. Response includes `x-request-id` in headers
3. Error occurs → ErrorBoundary catches it
4. Error reported to Sentry with context
5. User sees friendly error UI with error ID

### Correlation:

- Frontend error → Check Sentry for error ID
- Sentry error → Check logs for requestId tag
- Logs → Filter by requestId to see full request flow
- Network tab → See requestId in response headers

## Environment Variables

### Backend:

- `SENTRY_DSN` - Sentry DSN for backend error tracking (optional)
- `LOG_LEVEL` - Logging level (default: "debug" in dev, "info" in prod)

### Frontend:

- `VITE_SENTRY_DSN` - Sentry DSN for frontend error tracking (optional)

**Note:** Both Sentry DSNs are optional. The app works without them (local dev), but errors won't be tracked in Sentry.

## Files Created

### Backend:

- No new files (enhanced existing)

### Frontend:

- ✅ `client/src/monitoring.ts` - Frontend Sentry initialization

## Files Modified

### Backend:

- ✅ `server/_core/index.ts` - Request ID middleware, Sentry init, tRPC onError
- ✅ `server/_core/context.ts` - Added requestId and log to context
- ✅ `server/utils/logger.ts` - Enhanced createRequestLogger with userId
- ✅ `server/services/sentry.ts` - Enhanced request handler

### Frontend:

- ✅ `client/src/main.tsx` - Initialize Sentry
- ✅ `client/src/components/ErrorBoundary.tsx` - Enhanced with Sentry reporting

## Testing

### Manual Testing:

1. **Request ID Correlation:**

   ```bash
   curl -H "x-request-id: test-123" http://localhost:3002/api/trpc/mps.list
   # Check response headers for x-request-id
   # Check server logs for requestId: "test-123"
   ```

2. **Error Logging:**
   - Trigger a tRPC error (e.g., invalid input)
   - Check server logs for structured error with requestId
   - Check Sentry (if configured) for error with requestId tag

3. **Frontend Error Boundary:**
   - Add `throw new Error("Test error")` in a component
   - Verify error boundary catches it
   - Check Sentry (if configured) for error report
   - Verify error ID is displayed in UI

### Expected Log Format:

```json
{
  "level": "error",
  "time": "2026-01-11T21:30:00.000Z",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-123",
  "path": "mps.byId",
  "type": "query",
  "err": {
    "message": "MP not found",
    "stack": "..."
  },
  "msg": "tRPC error: MP not found"
}
```

## Next Steps

1. **Install @sentry/react:**

   ```bash
   npm install @sentry/react
   ```

2. **Configure Sentry DSNs:**
   - Backend: Set `SENTRY_DSN` in `.env`
   - Frontend: Set `VITE_SENTRY_DSN` in `.env`

3. **Verify Request ID in Network Tab:**
   - Open browser DevTools → Network tab
   - Make a request
   - Check response headers for `x-request-id`

4. **Test Error Tracking:**
   - Trigger an error
   - Check Sentry dashboard for error report
   - Verify requestId is in error context

---

**Status:** ✅ Phase 4 Complete
**Date:** 2026-01-11
**Next Phase:** Phase 5 - Performance Optimization
