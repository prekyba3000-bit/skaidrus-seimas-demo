import { useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import type { SeismicEvent } from "./SeismographChart";

interface DensityScrubberProps {
    events: SeismicEvent[];
    domain: [Date, Date]; // Total possible range (e.g., 2024-2028)
    value: [number, number]; // Current selected timestamps
    onChange: (value: [number, number]) => void; // Hot path
    onCommit?: (value: [number, number]) => void; // Cold path (URL)
    className?: string;
}

export function DensityScrubber({
    events,
    domain,
    value,
    onChange,
    onCommit,
    className,
}: DensityScrubberProps) {
    const [minDate, maxDate] = domain;
    const minTime = minDate.getTime();
    const maxTime = maxDate.getTime();
    const totalDuration = maxTime - minTime;

    // GENERATE SPARKLINE PATH
    // Create ~50 buckets representing density over time
    const sparklinePath = useMemo(() => {
        if (!events.length || totalDuration <= 0) return "";

        const bucketCount = 50;
        const bucketSize = totalDuration / bucketCount;
        const buckets = new Array(bucketCount).fill(0);

        // Fill buckets with Weighted Conflict Magnitude (or just count)
        // Using simple count for Density representation
        events.forEach((e) => {
            const time = new Date(e.date).getTime();
            const bucketIndex = Math.floor((time - minTime) / bucketSize);
            if (bucketIndex >= 0 && bucketIndex < bucketCount) {
                buckets[bucketIndex] += 1; // Or += e.magnitude for weighted
            }
        });

        const maxCount = Math.max(...buckets, 1);

        // Build SVG Path
        // Width = 100% (viewBox 0 0 100 20)
        // Height = 20px
        let path = `M 0 20 `;
        buckets.forEach((count, i) => {
            const x = (i / (bucketCount - 1)) * 100;
            const height = (count / maxCount) * 18; // Max height 18px (leave 2px padding)
            const y = 20 - height;
            path += `L ${x} ${y} `;
        });
        path += `L 100 20 Z`;

        return path;
    }, [events, minTime, totalDuration]);

    // Handle Radix Slider Change
    // Radix returns number[], we cast to [number, number]
    const handleChange = (vals: number[]) => {
        if (vals.length === 2) {
            onChange([vals[0], vals[1]]);
        }
    };

    const handleCommit = (vals: number[]) => {
        if (vals.length === 2 && onCommit) {
            onCommit([vals[0], vals[1]]);
        }
    };

    return (
        <div className={`relative w-full h-12 flex items-center ${className}`}>
            {/* SPARKLINE BACKGROUND */}
            <div className="absolute inset-0 top-3 h-6 w-full opacity-30 pointer-events-none">
                <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 100 20"
                    preserveAspectRatio="none"
                    className="fill-orange-500"
                >
                    <path d={sparklinePath} />
                </svg>
            </div>

            {/* SLIDER OVERLAY */}
            <Slider
                min={minTime}
                max={maxTime}
                step={1000 * 60 * 60 * 24} // 1 day step
                value={[value[0], value[1]]}
                onValueChange={handleChange}
                onValueCommit={handleCommit}
                className="z-10"
            />

            {/* Date Labels (Bottom) */}
            <div className="absolute -bottom-4 left-0 text-[10px] text-slate-500 font-mono">
                {minDate.getFullYear()}
            </div>
            <div className="absolute -bottom-4 right-0 text-[10px] text-slate-500 font-mono">
                {maxDate.getFullYear()}
            </div>
        </div>
    );
}
