import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "./useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should not update immediately when value changes", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial", delay: 500 },
      }
    );

    // Initial value should be set immediately
    expect(result.current).toBe("initial");

    // Change the value
    act(() => {
      rerender({ value: "updated", delay: 500 });
    });

    // Value should NOT update immediately
    expect(result.current).toBe("initial");
  });

  it("should update after the delay period", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial", delay: 500 },
      }
    );

    expect(result.current).toBe("initial");

    // Change the value
    act(() => {
      rerender({ value: "updated", delay: 500 });
    });

    // Value should still be initial
    expect(result.current).toBe("initial");

    // Fast-forward time by 499ms (just before delay)
    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current).toBe("initial");

    // Fast-forward time by 1ms more (total 500ms)
    act(() => {
      vi.advanceTimersByTime(1);
    });
    
    // Value should now be updated
    expect(result.current).toBe("updated");
  });

  it("should reset the timer if value changes again before delay", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial", delay: 500 },
      }
    );

    expect(result.current).toBe("initial");

    // Change to "first"
    act(() => {
      rerender({ value: "first", delay: 500 });
    });
    expect(result.current).toBe("initial");

    // Fast-forward 300ms
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("initial");

    // Change to "second" before delay completes
    act(() => {
      rerender({ value: "second", delay: 500 });
    });
    expect(result.current).toBe("initial");

    // Fast-forward 300ms more (total 600ms from "first", but only 300ms from "second")
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("initial");

    // Fast-forward 200ms more (total 500ms from "second")
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    // Value should now be "second"
    expect(result.current).toBe("second");
  });

  it("should work with different delay values", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial", delay: 1000 },
      }
    );

    act(() => {
      rerender({ value: "updated", delay: 1000 });
    });

    // After 500ms, should still be initial
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe("initial");

    // After 1000ms total, should be updated
    act(() => {
      vi.advanceTimersByTime(500);
    });
    
    // Value should now be updated
    expect(result.current).toBe("updated");
  });
});
