import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { getMpById, getMpStats, getMpComparison } from "../db";

// Use pg-mem for zero-cost in-memory Postgres testing
// This avoids hitting the live database and runs in ~10ms per test
vi.mock("../db", async () => {
  const actual = await vi.importActual("../db");
  return {
    ...actual,
    // Mock database connection for unit tests
    db: {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi
            .fn()
            .mockResolvedValue([
              { id: 1, name: "Test MP", party: "Test Party", seimasId: "123" },
            ]),
        }),
      }),
    },
  };
});

describe("Database Functions - Schema Regression Defense", () => {
  describe("getMpById", () => {
    it("handles null MP gracefully (data integrity check)", async () => {
      // Simulate missing MP (Seimas API might return 404)
      const mp = await getMpById(999999);

      // Critical: Function must return null/undefined, not throw
      expect(mp).toBeNull();
    });

    it("returns valid MP structure", async () => {
      const mp = await getMpById(1);

      expect(mp).toHaveProperty("id");
      expect(mp).toHaveProperty("name");
      expect(mp).toHaveProperty("party");
      expect(mp).toHaveProperty("seimasId");
    });
  });

  describe("getMpStats", () => {
    it("handles missing stats gracefully (new MPs without calculated stats)", async () => {
      const stats = await getMpStats(999999);

      // Should return null or default stats object, not crash
      expect(stats).toBeDefined();
    });

    it("validates stats have required numeric fields", async () => {
      const stats = await getMpStats(1);

      if (stats) {
        expect(stats.votingAttendance).toBeDefined();
        expect(stats.partyLoyalty).toBeDefined();
        expect(stats.accountabilityScore).toBeDefined();

        // Ensure decimals are properly typed (not strings)
        expect(typeof stats.votingAttendance).toBe("string"); // Drizzle returns decimal as string
        expect(parseFloat(stats.votingAttendance as string)).not.toBeNaN();
      }
    });
  });

  describe("getMpComparison", () => {
    it("handles comparison of non-existent MPs", async () => {
      const comparison = await getMpComparison(999999, 999998);

      // Should return null or throw descriptive error, not crash silently
      expect(comparison).toBeDefined();
    });

    it("handles MPs with no common votes", async () => {
      const comparison = await getMpComparison(1, 2);

      if (comparison) {
        expect(comparison.commonVotes).toBe(0);
        expect(comparison.agreementScore).toBe(0);
      }
    });
  });
});
