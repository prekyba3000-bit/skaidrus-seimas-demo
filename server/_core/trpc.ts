import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from "@shared/const";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { rateLimiter, RATE_LIMITS } from "../services/rate-limiter";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;

// Rate limiting middleware for public procedures
const rateLimitMiddleware = t.middleware(async ({ ctx, next, path }) => {
  // Extract IP from context
  const ip =
    ctx.req.ip || (ctx.req.headers["x-forwarded-for"] as string) || "unknown";
  const key = ctx.user?.openId ? `user:${ctx.user.openId}` : `ip:${ip}`;

  // Choose limit type based on path
  let limitType: keyof typeof RATE_LIMITS = "API_READ";
  if (path?.includes("search")) {
    limitType = "API_SEARCH";
  } else if (path?.includes("compare") || path?.includes("pulse")) {
    limitType = "API_EXPENSIVE";
  }

  const result = await rateLimiter.consume(limitType, key);

  if (!result.allowed) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Rate limit exceeded. Retry after ${result.retryAfter || 60} seconds.`,
    });
  }

  return next();
});

export const publicProcedure = t.procedure.use(rateLimitMiddleware);

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  })
);
