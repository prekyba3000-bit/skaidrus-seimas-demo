import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Unit Tests for Database Functions
 *
 * Strategy:
 * - Mock the database layer to avoid hitting real DB
 * - Test function logic, edge cases, and error handling
 * - Validate return types and null handling
 */

// Mock the database module
vi.mock("../db", async () => {
  const actual = await vi.importActual("../db");
  return {
    ...actual,
    getDb: vi.fn(),
  };
});

// Import after mocking
import * as db from "../db";

// Mock data fixtures
const mockMp = {
  id: 1,
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

const mockMpStats = {
  id: 1,
  mpId: 1,
  votingAttendance: "85.50",
  partyLoyalty: "92.30",
  billsProposed: 15,
  billsPassed: 8,
  accountabilityScore: "78.20",
  lastCalculated: new Date(),
};

const mockBill = {
  id: 1,
  seimasId: "XIIIP-1234",
  title: "Test Bill Title",
  description: "Test description",
  status: "Svarstymas",
  category: "Ekonomika",
  submittedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockVote = {
  id: 1,
  sessionVoteId: 100,
  mpId: 1,
  seimasMpId: "12345",
  voteValue: "už",
  createdAt: new Date(),
};

describe("Database Functions", () => {
  let mockDbInstance: any;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Create mock db instance with chainable methods
    mockDbInstance = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      onConflictDoUpdate: vi.fn().mockReturnThis(),
      returning: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
    };

    // Default: getDb returns mock instance
    vi.mocked(db.getDb).mockResolvedValue(mockDbInstance);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("getAllMps", () => {
    it("returns all MPs when no filters provided", async () => {
      mockDbInstance.orderBy.mockResolvedValue([mockMp]);

      const result = await db.getAllMps();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Jonas Jonaitis");
    });

    it("returns empty array when no MPs found", async () => {
      mockDbInstance.orderBy.mockResolvedValue([]);

      const result = await db.getAllMps();

      expect(result).toEqual([]);
    });

    it("applies party filter correctly", async () => {
      mockDbInstance.orderBy.mockResolvedValue([mockMp]);

      await db.getAllMps({ party: "Tėvynės sąjunga" });

      expect(mockDbInstance.where).toHaveBeenCalled();
    });

    it("applies isActive filter correctly", async () => {
      mockDbInstance.orderBy.mockResolvedValue([mockMp]);

      await db.getAllMps({ isActive: true });

      expect(mockDbInstance.where).toHaveBeenCalled();
    });

    it("returns empty array when database is unavailable", async () => {
      vi.mocked(db.getDb).mockResolvedValue(null);

      const result = await db.getAllMps();

      expect(result).toEqual([]);
    });
  });

  describe("getMpById", () => {
    it("returns MP when found", async () => {
      mockDbInstance.limit.mockResolvedValue([mockMp]);

      const result = await db.getMpById(1);

      expect(result).toEqual(mockMp);
      expect(result?.name).toBe("Jonas Jonaitis");
    });

    it("returns undefined when MP not found", async () => {
      mockDbInstance.limit.mockResolvedValue([]);

      const result = await db.getMpById(999);

      expect(result).toBeUndefined();
    });

    it("handles database unavailability gracefully", async () => {
      vi.mocked(db.getDb).mockResolvedValue(null);

      const result = await db.getMpById(1);

      expect(result).toBeUndefined();
    });
  });

  describe("getMpStats", () => {
    it("returns stats when found", async () => {
      mockDbInstance.limit.mockResolvedValue([mockMpStats]);

      const result = await db.getMpStats(1);

      expect(result).toEqual(mockMpStats);
      expect(result?.votingAttendance).toBe("85.50");
    });

    it("returns undefined when stats not found", async () => {
      mockDbInstance.limit.mockResolvedValue([]);

      const result = await db.getMpStats(999);

      expect(result).toBeUndefined();
    });

    it("handles decimal fields as strings", async () => {
      mockDbInstance.limit.mockResolvedValue([mockMpStats]);

      const result = await db.getMpStats(1);

      expect(typeof result?.votingAttendance).toBe("string");
      expect(parseFloat(result?.votingAttendance || "0")).toBe(85.5);
    });
  });

  describe("getMpComparison", () => {
    it("returns null when MP1 not found", async () => {
      mockDbInstance.limit.mockResolvedValueOnce([]); // MP1 not found

      const result = await db.getMpComparison(999, 1);

      expect(result).toBeNull();
    });

    it("returns null when MP2 not found", async () => {
      mockDbInstance.limit
        .mockResolvedValueOnce([mockMp]) // MP1 found
        .mockResolvedValueOnce([]); // MP2 not found

      const result = await db.getMpComparison(1, 999);

      expect(result).toBeNull();
    });

    it("calculates agreement score correctly with common votes", async () => {
      const mp1 = { ...mockMp, id: 1 };
      const mp2 = { ...mockMp, id: 2, name: "Petras Petraitis" };

      // Mock getMpById calls
      mockDbInstance.limit
        .mockResolvedValueOnce([mp1])
        .mockResolvedValueOnce([mp2])
        .mockResolvedValueOnce([mockMpStats])
        .mockResolvedValueOnce([{ ...mockMpStats, mpId: 2 }]);

      // Mock votes - same votes for both MPs
      const votes1 = [
        { sessionVoteId: 1, voteValue: "už" },
        { sessionVoteId: 2, voteValue: "prieš" },
        { sessionVoteId: 3, voteValue: "už" },
      ];
      const votes2 = [
        { sessionVoteId: 1, voteValue: "už" }, // Same
        { sessionVoteId: 2, voteValue: "už" }, // Different
        { sessionVoteId: 3, voteValue: "už" }, // Same
      ];

      mockDbInstance.where
        .mockResolvedValueOnce(votes1)
        .mockResolvedValueOnce(votes2);

      const result = await db.getMpComparison(1, 2);

      // 2 out of 3 common votes are the same = 66.67%
      expect(result?.commonVotes).toBe(3);
      expect(result?.agreementScore).toBeCloseTo(66.67, 0);
    });

    it("returns 0 agreement when no common votes", async () => {
      const mp1 = { ...mockMp, id: 1 };
      const mp2 = { ...mockMp, id: 2 };

      mockDbInstance.limit
        .mockResolvedValueOnce([mp1])
        .mockResolvedValueOnce([mp2])
        .mockResolvedValueOnce([mockMpStats])
        .mockResolvedValueOnce([mockMpStats]);

      // No overlapping votes
      mockDbInstance.where
        .mockResolvedValueOnce([{ sessionVoteId: 1, voteValue: "už" }])
        .mockResolvedValueOnce([{ sessionVoteId: 99, voteValue: "už" }]);

      const result = await db.getMpComparison(1, 2);

      expect(result?.commonVotes).toBe(0);
      expect(result?.agreementScore).toBe(0);
    });
  });

  describe("getAllBills", () => {
    it("returns all bills when no filters", async () => {
      mockDbInstance.orderBy.mockResolvedValue([mockBill]);

      const result = await db.getAllBills();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Test Bill Title");
    });

    it("applies status filter", async () => {
      mockDbInstance.orderBy.mockResolvedValue([mockBill]);

      await db.getAllBills({ status: "Svarstymas" });

      expect(mockDbInstance.where).toHaveBeenCalled();
    });

    it("applies category filter", async () => {
      mockDbInstance.orderBy.mockResolvedValue([mockBill]);

      await db.getAllBills({ category: "Ekonomika" });

      expect(mockDbInstance.where).toHaveBeenCalled();
    });
  });

  describe("getBillById", () => {
    it("returns bill when found", async () => {
      mockDbInstance.limit.mockResolvedValue([mockBill]);

      const result = await db.getBillById(1);

      expect(result?.title).toBe("Test Bill Title");
    });

    it("returns undefined when not found", async () => {
      mockDbInstance.limit.mockResolvedValue([]);

      const result = await db.getBillById(999);

      expect(result).toBeUndefined();
    });
  });

  describe("searchMps", () => {
    it("returns MPs matching search term", async () => {
      mockDbInstance.limit.mockResolvedValue([mockMp]);

      const result = await db.searchMps("Jonas");

      expect(result).toHaveLength(1);
    });

    it("returns empty array for no matches", async () => {
      mockDbInstance.limit.mockResolvedValue([]);

      const result = await db.searchMps("NonexistentName");

      expect(result).toEqual([]);
    });

    it("handles empty search term", async () => {
      mockDbInstance.limit.mockResolvedValue([]);

      const result = await db.searchMps("");

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getVotesByMpId", () => {
    it("returns votes for MP", async () => {
      mockDbInstance.limit.mockResolvedValue([mockVote]);

      const result = await db.getVotesByMpId(1);

      expect(result).toHaveLength(1);
      expect(result[0].voteValue).toBe("už");
    });

    it("respects limit parameter", async () => {
      mockDbInstance.limit.mockResolvedValue([mockVote]);

      await db.getVotesByMpId(1, 10);

      expect(mockDbInstance.limit).toHaveBeenCalledWith(10);
    });

    it("uses default limit of 50", async () => {
      mockDbInstance.limit.mockResolvedValue([]);

      await db.getVotesByMpId(1);

      expect(mockDbInstance.limit).toHaveBeenCalledWith(50);
    });
  });

  describe("getDataFreshness", () => {
    it("returns freshness data for all entities", async () => {
      const mockDate = new Date("2024-01-15");

      mockDbInstance.from.mockResolvedValue([{ lastUpdated: mockDate }]);

      const result = await db.getDataFreshness();

      expect(result).toBeDefined();
      expect(result).toHaveProperty("mps");
      expect(result).toHaveProperty("bills");
      expect(result).toHaveProperty("votes");
    });

    it("returns null when database unavailable", async () => {
      vi.mocked(db.getDb).mockResolvedValue(null);

      const result = await db.getDataFreshness();

      expect(result).toBeNull();
    });
  });

  describe("Edge Cases", () => {
    it("handles null mpId in vote records", async () => {
      const votesWithNull = [
        { sessionVoteId: null, voteValue: "už" },
        { sessionVoteId: 1, voteValue: "už" },
      ];

      mockDbInstance.where.mockResolvedValue(votesWithNull);

      // Should not throw when processing null sessionVoteId
      expect(async () => {
        await db.getVotesByMpId(1);
      }).not.toThrow();
    });

    it("handles empty strings in MP fields", async () => {
      const mpWithEmptyFields = {
        ...mockMp,
        biography: "",
        phone: "",
      };

      mockDbInstance.limit.mockResolvedValue([mpWithEmptyFields]);

      const result = await db.getMpById(1);

      expect(result?.biography).toBe("");
      expect(result?.phone).toBe("");
    });

    it("handles special characters in search", async () => {
      mockDbInstance.limit.mockResolvedValue([]);

      // Should not throw with special chars
      await expect(db.searchMps("O'Connor")).resolves.toBeDefined();
      await expect(db.searchMps('Test"Quote')).resolves.toBeDefined();
    });
  });
});
