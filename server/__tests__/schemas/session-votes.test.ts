import { describe, it, expect } from "vitest";
import {
  validateSessionVote,
  validateSessionMpVote,
  sessionVoteSchema,
} from "../schemas/session-votes.schema";
import { ZodError } from "zod";

describe("Session Votes Validation (Fail-Fast Defense)", () => {
  describe("sessionVoteSchema", () => {
    it("accepts valid session vote data", () => {
      const validData = {
        seimasVoteId: "VOTE-2024-114-001",
        sittingId: "SIT-114",
        sessionId: "SES-2024-01",
        question: "Dėl įstatymo projekto priėmimo",
        voteDate: new Date("2024-01-15T14:30:00Z"),
        voteTime: "14:30",
        votedFor: 71,
        votedAgainst: 23,
        abstained: 5,
        totalVoted: 99,
        comment: "Regular voting session",
      };

      const result = validateSessionVote(validData);
      expect(result.seimasVoteId).toBe("VOTE-2024-114-001");
      expect(result.votedFor).toBe(71);
    });

    it("accepts nullable voteTime and comment (legacy data)", () => {
      const legacyData = {
        seimasVoteId: "VOTE-2020-001",
        sittingId: "SIT-001",
        sessionId: "SES-001",
        question: "Legacy vote",
        voteDate: new Date("2020-01-01"),
        voteTime: null,
        comment: null,
        votedFor: 50,
        votedAgainst: 20,
        abstained: 10,
        totalVoted: 80,
      };

      expect(() => validateSessionVote(legacyData)).not.toThrow();
    });

    it("throws if required field is missing (API schema change)", () => {
      const invalidData = {
        seimasVoteId: "VOTE-123",
        sittingId: "SIT-123",
        // sessionId MISSING - simulates API breaking change
        question: "Test",
        voteDate: new Date(),
      };

      expect(() => validateSessionVote(invalidData)).toThrow(ZodError);
    });

    it("throws if seimasVoteId exceeds 50 chars (data corruption defense)", () => {
      const tooLongId = "A".repeat(51);
      const invalidData = {
        seimasVoteId: tooLongId,
        sittingId: "SIT-123",
        sessionId: "SES-123",
        question: "Test",
        voteDate: new Date(),
      };

      expect(() => validateSessionVote(invalidData)).toThrow(ZodError);
      expect(() => validateSessionVote(invalidData)).toThrow(
        /exceeds 50 chars/
      );
    });

    it("throws if voteDate is invalid format", () => {
      const invalidData = {
        seimasVoteId: "VOTE-123",
        sittingId: "SIT-123",
        sessionId: "SES-123",
        question: "Test",
        voteDate: "not-a-date",
      };

      expect(() => validateSessionVote(invalidData)).toThrow(ZodError);
    });
  });

  describe("sessionMpVoteSchema", () => {
    it("accepts valid MP vote", () => {
      const validMpVote = {
        sessionVoteId: 123,
        mpId: 45,
        seimasMpId: "MP-001",
        voteValue: "už",
      };

      const result = validateSessionMpVote(validMpVote);
      expect(result.voteValue).toBe("už");
    });

    it("throws if voteValue is not in allowed enum", () => {
      const invalidVote = {
        sessionVoteId: 123,
        mpId: 45,
        seimasMpId: "MP-001",
        voteValue: "INVALID_VALUE",
      };

      expect(() => validateSessionMpVote(invalidVote)).toThrow(ZodError);
    });
  });
});
