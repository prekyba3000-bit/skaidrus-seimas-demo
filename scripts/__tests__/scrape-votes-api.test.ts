import { describe, it, expect, beforeAll, afterAll } from "vitest";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import { validateSessionVote } from "@/server/schemas/session-votes.schema";
import { ZodError } from "zod";

/**
 * Integration test for sync:votes pipeline
 *
 * Tests the critical voting data ingestion path without hitting live database
 * Validates that Zod schemas catch data format changes from Seimas API
 */

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

describe("Voting Data Ingestion Pipeline", () => {
  describe("Session Vote Validation (API Contract)", () => {
    it("validates well-formed Seimas API vote data", () => {
      const mockVoteData = {
        seimasVoteId: "123456",
        sittingId: "114",
        sessionId: "1",
        question: "Dėl įstatymo projekto priėmimo",
        voteDate: new Date("2024-01-15"),
        voteTime: "14:30",
        votedFor: 71,
        votedAgainst: 23,
        abstained: 5,
        totalVoted: 99,
        comment: "Regular voting session",
      };

      expect(() => validateSessionVote(mockVoteData)).not.toThrow();
      const validated = validateSessionVote(mockVoteData);
      expect(validated.seimasVoteId).toBe("123456");
      expect(validated.votedFor).toBe(71);
    });

    it("handles legacy data with null voteTime and comment", () => {
      const legacyData = {
        seimasVoteId: "LEGACY-001",
        sittingId: "50",
        sessionId: "5",
        question: "Historical vote",
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

    it("rejects data if Seimas API changes required fields", () => {
      const brokenData = {
        seimasVoteId: "999",
        sittingId: "999",
        // sessionId MISSING - simulates API breaking change
        question: "Test",
        voteDate: new Date(),
      };

      expect(() => validateSessionVote(brokenData)).toThrow(ZodError);
    });

    it("rejects oversized IDs (prevents DB column overflow)", () => {
      const oversizedId = "A".repeat(51); // Max is 50
      const invalidData = {
        seimasVoteId: oversizedId,
        sittingId: "123",
        sessionId: "1",
        question: "Test",
        voteDate: new Date(),
      };

      expect(() => validateSessionVote(invalidData)).toThrow(ZodError);
      try {
        validateSessionVote(invalidData);
      } catch (err) {
        if (err instanceof ZodError) {
          expect(err.issues[0].message).toContain("exceeds 50 chars");
        }
      }
    });

    it("coerces date strings to Date objects", () => {
      const dataWithStringDate = {
        seimasVoteId: "123",
        sittingId: "114",
        sessionId: "1",
        question: "Test",
        voteDate: "2024-01-15T14:30:00Z", // ISO string
        votedFor: 10,
        votedAgainst: 5,
        abstained: 2,
        totalVoted: 17,
      };

      const validated = validateSessionVote(dataWithStringDate);
      expect(validated.voteDate).toBeInstanceOf(Date);
    });
  });

  describe("Edge Cases (Empty Sessions / Missing MPs)", () => {
    it("handles empty vote results gracefully", () => {
      const emptyVote = {
        seimasVoteId: "EMPTY-001",
        sittingId: "100",
        sessionId: "10",
        question: "Vote with no participants",
        voteDate: new Date(),
        votedFor: 0,
        votedAgainst: 0,
        abstained: 0,
        totalVoted: 0,
      };

      expect(() => validateSessionVote(emptyVote)).not.toThrow();
    });

    it("rejects negative vote counts", () => {
      const negativeVotes = {
        seimasVoteId: "123",
        sittingId: "123",
        sessionId: "1",
        question: "Test",
        voteDate: new Date(),
        votedFor: -5, // Invalid
        votedAgainst: 10,
        abstained: 0,
        totalVoted: 5,
      };

      expect(() => validateSessionVote(negativeVotes)).toThrow(ZodError);
    });
  });

  describe("Live API Response Parsing (Smoke Test)", () => {
    it(
      "can parse real Seimas XML structure",
      async () => {
        // This is a minimal smoke test - replace with real sample XML
        const sampleXML = `
        <SeimoInformacija>
          <SeimoNariųBalsavimas>
            <BendriBalsavimoRezultatai 
              balsavimo_laikas="14:30" 
              balsavo="99" 
              už="71" 
              prieš="23" 
              susilaikė="5"
            />
          </SeimoNariųBalsavimas>
        </SeimoInformacija>
      `;

        const parsed = parser.parse(sampleXML);
        const results =
          parsed.SeimoInformacija.SeimoNariųBalsavimas
            .BendriBalsavimoRezultatai;

        expect(results["@_balsavo"]).toBe("99");
        expect(results["@_už"]).toBe("71");
      },
      { timeout: 10000 }
    );
  });
});
