import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { createRequestLogger } from "../utils/logger";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  requestId: string;
  log: ReturnType<typeof createRequestLogger>;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  // Get request ID from request (set by middleware)
  const requestId = (opts.req as any).requestId || "unknown";

  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  // Create request-scoped logger with userId if available
  const log = createRequestLogger(requestId, user?.openId);

  // Set request ID in response header for correlation
  opts.res.setHeader("x-request-id", requestId);

  return {
    req: opts.req,
    res: opts.res,
    user,
    requestId,
    log,
  };
}
