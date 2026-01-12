/**
 * Test Helpers for tRPC Context
 * 
 * Provides utilities for creating mock authenticated contexts for testing
 */

import type { TrpcContext } from "../../_core/context";
import type { User } from "../../../drizzle/schema";
import { vi } from "vitest";

/**
 * Create a mock authenticated context for testing protected procedures
 */
export function createAuthenticatedContext(user?: Partial<User>): TrpcContext {
  const mockUser: User = {
    id: 1,
    openId: "test-user-123",
    name: "Test User",
    email: "test@example.com",
    loginMethod: "test",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...user,
  };

  return {
    req: {
      headers: {},
      method: "GET",
      url: "/",
      query: {},
    } as any,
    res: {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    } as any,
    user: mockUser,
  };
}

/**
 * Create a mock unauthenticated context (for testing public procedures)
 */
export function createUnauthenticatedContext(): TrpcContext {
  return {
    req: {
      headers: {},
      method: "GET",
      url: "/",
      query: {},
    } as any,
    res: {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    } as any,
    user: null,
  };
}

/**
 * Create a mock admin context for testing admin procedures
 */
export function createAdminContext(user?: Partial<User>): TrpcContext {
  return createAuthenticatedContext({
    role: "admin",
    ...user,
  });
}
