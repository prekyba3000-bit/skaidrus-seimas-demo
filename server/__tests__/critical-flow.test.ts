/**
 * Critical Flow Integration Test
 * 
 * Tests the complete user journey:
 * 1. Login (mock authenticated session)
 * 2. Browse MP Profile (public endpoint)
 * 3. Add MP to Watchlist (protected endpoint)
 * 4. Verify Watchlist (protected endpoint)
 * 5. Remove from Watchlist (protected endpoint)
 * 
 * This test ensures authentication and authorization work correctly
 * after the Phase 1 security lockdown.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "../routers";
import { createAuthenticatedContext, createUnauthenticatedContext } from "./helpers/test-context";
import * as db from "../services/database";

// Mock the database service
vi.mock("../services/database", async () => {
  const actual = await vi.importActual("../services/database");
  return {
    ...actual,
    getMpById: vi.fn(),
    getAssistantsByMpId: vi.fn(),
    getTripsByMpId: vi.fn(),
    getWatchlist: vi.fn(),
    isFollowingMp: vi.fn(),
    toggleFollowMp: vi.fn(),
    getDb: vi.fn(),
  };
});

describe("Critical Flow: User Journey", () => {
  const testUserId = "test-user-123";
  const testMpId = 1;
  const testMpId2 = 2;

  const mockMp = {
    id: testMpId,
    seimasId: "12345",
    name: "Jonas Jonaitis",
    party: "Tėvynės sąjunga",
    faction: "TS-LKD",
    district: "Vilnius",
    districtNumber: 1,
    email: "jonas@lrs.lt",
    phone: "+370 5 123456",
    photoUrl: "https://example.com/photo.jpg",
    biography: "Test biography",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMp2 = {
    ...mockMp,
    id: testMpId2,
    name: "Petras Petraitis",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. Browse MP Profile (Public)", () => {
    it("should allow unauthenticated users to view MP profiles", async () => {
      vi.mocked(db.getMpById).mockResolvedValue(mockMp);
      vi.mocked(db.getAssistantsByMpId).mockResolvedValue([]);
      vi.mocked(db.getTripsByMpId).mockResolvedValue([]);

      const ctx = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.mps.byId({ id: testMpId });

      expect(result).toBeDefined();
      expect(result.name).toBe("Jonas Jonaitis");
      expect(db.getMpById).toHaveBeenCalledWith(testMpId);
    });

    it("should return 404 for non-existent MP", async () => {
      vi.mocked(db.getMpById).mockResolvedValue(undefined);
      vi.mocked(db.getAssistantsByMpId).mockResolvedValue([]);
      vi.mocked(db.getTripsByMpId).mockResolvedValue([]);

      const ctx = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.mps.byId({ id: 999999 })).rejects.toThrow("not found");
    });
  });

  describe("2. Add MP to Watchlist (Protected)", () => {
    it("should allow authenticated users to follow an MP", async () => {
      vi.mocked(db.isFollowingMp).mockResolvedValue(false);
      vi.mocked(db.toggleFollowMp).mockResolvedValue({ isFollowing: true, followId: 1 });

      const ctx = createAuthenticatedContext({ openId: testUserId });
      const caller = appRouter.createCaller(ctx);

      const result = await caller.user.toggleFollowMp({ mpId: testMpId });

      expect(result.isFollowing).toBe(true);
      expect(db.toggleFollowMp).toHaveBeenCalledWith(testUserId, testMpId);
    });

    it("should reject unauthenticated requests to follow MP", async () => {
      const ctx = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.user.toggleFollowMp({ mpId: testMpId })).rejects.toThrow();
    });
  });

  describe("3. View Watchlist (Protected)", () => {
    it("should return user's watchlist for authenticated users", async () => {
      const mockWatchlist = [
        { ...mockMp, followedAt: new Date() },
        { ...mockMp2, followedAt: new Date() },
      ];

      vi.mocked(db.getWatchlist).mockResolvedValue(mockWatchlist);

      const ctx = createAuthenticatedContext({ openId: testUserId });
      const caller = appRouter.createCaller(ctx);

      const result = await caller.user.getWatchlist();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Jonas Jonaitis");
      expect(db.getWatchlist).toHaveBeenCalledWith(testUserId);
    });

    it("should reject unauthenticated requests to view watchlist", async () => {
      const ctx = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.user.getWatchlist()).rejects.toThrow();
    });

    it("should return empty array for users with no followed MPs", async () => {
      vi.mocked(db.getWatchlist).mockResolvedValue([]);

      const ctx = createAuthenticatedContext({ openId: testUserId });
      const caller = appRouter.createCaller(ctx);

      const result = await caller.user.getWatchlist();

      expect(result).toEqual([]);
    });
  });

  describe("4. Check Follow Status (Protected)", () => {
    it("should return true if user follows MP", async () => {
      vi.mocked(db.isFollowingMp).mockResolvedValue(true);

      const ctx = createAuthenticatedContext({ openId: testUserId });
      const caller = appRouter.createCaller(ctx);

      const result = await caller.user.isFollowingMp({ mpId: testMpId });

      expect(result).toBe(true);
      expect(db.isFollowingMp).toHaveBeenCalledWith(testUserId, testMpId);
    });

    it("should return false if user does not follow MP", async () => {
      vi.mocked(db.isFollowingMp).mockResolvedValue(false);

      const ctx = createAuthenticatedContext({ openId: testUserId });
      const caller = appRouter.createCaller(ctx);

      const result = await caller.user.isFollowingMp({ mpId: testMpId });

      expect(result).toBe(false);
    });

    it("should reject unauthenticated requests", async () => {
      const ctx = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.user.isFollowingMp({ mpId: testMpId })).rejects.toThrow();
    });
  });

  describe("5. Complete User Journey", () => {
    it("should complete full flow: Browse → Follow → Verify → Unfollow", async () => {
      // Step 1: Browse MP Profile (public)
      vi.mocked(db.getMpById).mockResolvedValue(mockMp);
      vi.mocked(db.getAssistantsByMpId).mockResolvedValue([]);
      vi.mocked(db.getTripsByMpId).mockResolvedValue([]);

      const unauthenticatedCtx = createUnauthenticatedContext();
      const publicCaller = appRouter.createCaller(unauthenticatedCtx);

      const mpProfile = await publicCaller.mps.byId({ id: testMpId });
      expect(mpProfile.name).toBe("Jonas Jonaitis");

      // Step 2: Follow MP (protected - requires auth)
      vi.mocked(db.isFollowingMp).mockResolvedValue(false);
      vi.mocked(db.toggleFollowMp).mockResolvedValue({ isFollowing: true, followId: 1 });

      const authenticatedCtx = createAuthenticatedContext({ openId: testUserId });
      const protectedCaller = appRouter.createCaller(authenticatedCtx);

      const followResult = await protectedCaller.user.toggleFollowMp({ mpId: testMpId });
      expect(followResult.isFollowing).toBe(true);

      // Step 3: Verify MP is in watchlist
      vi.mocked(db.getWatchlist).mockResolvedValue([{ ...mockMp, followedAt: new Date() }]);
      vi.mocked(db.isFollowingMp).mockResolvedValue(true);

      const watchlist = await protectedCaller.user.getWatchlist();
      expect(watchlist).toHaveLength(1);
      expect(watchlist[0].id).toBe(testMpId);

      const isFollowing = await protectedCaller.user.isFollowingMp({ mpId: testMpId });
      expect(isFollowing).toBe(true);

      // Step 4: Unfollow MP
      vi.mocked(db.toggleFollowMp).mockResolvedValue({ isFollowing: false });

      const unfollowResult = await protectedCaller.user.toggleFollowMp({ mpId: testMpId });
      expect(unfollowResult.isFollowing).toBe(false);

      // Step 5: Verify MP is removed from watchlist
      vi.mocked(db.getWatchlist).mockResolvedValue([]);
      vi.mocked(db.isFollowingMp).mockResolvedValue(false);

      const emptyWatchlist = await protectedCaller.user.getWatchlist();
      expect(emptyWatchlist).toEqual([]);

      const notFollowing = await protectedCaller.user.isFollowingMp({ mpId: testMpId });
      expect(notFollowing).toBe(false);
    });
  });

  describe("6. Authorization Boundaries", () => {
    it("should prevent users from accessing other users' watchlists", async () => {
      // User 1's watchlist
      vi.mocked(db.getWatchlist).mockResolvedValue([{ ...mockMp, followedAt: new Date() }]);

      const user1Ctx = createAuthenticatedContext({ openId: "user-1" });
      const user1Caller = appRouter.createCaller(user1Ctx);

      const user1Watchlist = await user1Caller.user.getWatchlist();
      expect(user1Watchlist).toHaveLength(1);
      expect(db.getWatchlist).toHaveBeenCalledWith("user-1");

      // User 2's watchlist (should be different)
      vi.mocked(db.getWatchlist).mockResolvedValue([{ ...mockMp2, followedAt: new Date() }]);

      const user2Ctx = createAuthenticatedContext({ openId: "user-2" });
      const user2Caller = appRouter.createCaller(user2Ctx);

      const user2Watchlist = await user2Caller.user.getWatchlist();
      expect(user2Watchlist).toHaveLength(1);
      expect(user2Watchlist[0].id).toBe(testMpId2);
      expect(db.getWatchlist).toHaveBeenCalledWith("user-2");
    });
  });
});
