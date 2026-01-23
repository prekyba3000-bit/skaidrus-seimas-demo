import type { SeismicEvent } from "../SeismographChart";

interface FilterOptions {
  minDate: Date;
  maxDate: Date;
  maxNodes?: number;
}

export function filterVisibleEvents(
  events: SeismicEvent[],
  { minDate, maxDate, maxNodes = 200 }: FilterOptions
): (SeismicEvent & { dateObj: number; magnitude: number })[] {
  const minTime = minDate.getTime();
  const maxTime = maxDate.getTime();

  // 1. Initial Filter by window
  const filtered = events.filter(e => {
    const time = new Date(e.date).getTime();
    return time >= minTime && time <= maxTime;
  });

  // 2. Transform (Calculate Magnitude)
  let chartData = filtered.map(e => ({
    ...e,
    dateObj: new Date(e.date).getTime(),
    magnitude: 100 / Math.max(1, e.margin),
  }));

  // 3. Strict Node Limit
  if (chartData.length > maxNodes) {
    // Sort by Magnitude (prioritize big spikes)
    chartData.sort((a, b) => b.magnitude - a.magnitude);
    // Slice
    chartData = chartData.slice(0, maxNodes);
    // Sort back by Date for rendering
    chartData.sort((a, b) => a.dateObj - b.dateObj);
  }

  return chartData;
}
