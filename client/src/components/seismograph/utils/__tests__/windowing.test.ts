import { describe, it, expect } from "vitest";
import { filterVisibleEvents } from "../windowing";
import type { SeismicEvent } from "../../SeismographChart";

describe("Seismograph Windowing Logic", () => {
  // Generate 1,000 dummy events
  const heavyDataset = Array.from({ length: 1000 }).map((_, i) => ({
    id: i,
    date: new Date(2020, 0, 1 + i).toISOString(),
    margin: 10,
    question: `Question ${i}`,
    votedFor: 50,
    votedAgainst: 50,
    abstain: 0,
    totalVoted: 100,
    mpAVote: "for",
    mpBVote: "against",
    magnitude: 0, // Mock, will be recalculated
  })) as SeismicEvent[]; // Cast to satisfy type

  it("should strict-limit rendering to safety threshold (e.g., 200 nodes)", () => {
    const visibleEvents = filterVisibleEvents(heavyDataset, {
      minDate: new Date(2020, 0, 1),
      maxDate: new Date(2023, 0, 1),
      maxNodes: 200, // Safety limit
    });

    // CRITICAL: Even if the date range covers all 1,000 events,
    // the windowing logic MUST downsample or slice to 200 to save FPS.
    expect(visibleEvents.length).toBeLessThanOrEqual(200);
  });

  it("should return 0 nodes if date range is outside data", () => {
    const visibleEvents = filterVisibleEvents(heavyDataset, {
      minDate: new Date(1990, 0, 1),
      maxDate: new Date(1991, 0, 1),
    });

    expect(visibleEvents).toHaveLength(0);
  });
});
