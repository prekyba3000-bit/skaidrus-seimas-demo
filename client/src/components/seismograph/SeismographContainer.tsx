import { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import { useLocation, useSearch } from "wouter";
import { SeismographChart, type SeismicEvent } from "./SeismographChart";
import { DetailSheet } from "./DetailSheet";
import { DensityScrubber } from "./DensityScrubber";
import { Skeleton } from "@/components/ui/skeleton";

interface SeismographContainerProps {
    mpAId: number;
    mpBId: number;
    className?: string; // Allow external layout control
}

export function SeismographContainer({ mpAId, mpBId, className }: SeismographContainerProps) {
    const [selectedEvent, setSelectedEvent] = useState<SeismicEvent | null>(null);
    const [location, setLocation] = useLocation();
    const search = useSearch();

    // 1. URL State Initialization
    // Parse ?min=ISO&max=ISO
    const getInitialWindow = (): [number, number] | null => {
        const params = new URLSearchParams(search);
        const min = params.get("min");
        const max = params.get("max");
        if (min && max) {
            const t1 = new Date(min).getTime();
            const t2 = new Date(max).getTime();
            if (!isNaN(t1) && !isNaN(t2)) return [t1, t2];
        }
        return null;
    };

    const [windowRange, setWindowRange] = useState<[number, number] | null>(getInitialWindow);

    // 2. Fetch Data (Broader Limit)
    // We fetch up to 500 events to give the scrubber enough data to work with client-side
    const { data, isLoading, isError, error } = trpc.seismograph.getSeismicEvents.useQuery(
        {
            mpA: mpAId,
            mpB: mpBId,
            limit: 500,
        },
        {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
        }
    );

    // 3. Auto-Initialize Window if not in URL
    useEffect(() => {
        if (data?.meta && !windowRange) {
            const min = data.meta.minDate ? new Date(data.meta.minDate).getTime() : Date.now() - 31536000000; // Default 1 year back
            const max = data.meta.maxDate ? new Date(data.meta.maxDate).getTime() : Date.now();
            setWindowRange([min, max]);
        }
    }, [data, windowRange]);

    // Loading / Error States
    if (isLoading) {
        return (
            <div className={`w-full space-y-4 ${className}`}>
                <Skeleton className="h-64 w-full rounded-xl bg-slate-900/50" />
                <div className="flex gap-2">
                    <Skeleton className="h-4 w-24 bg-slate-800" />
                    <Skeleton className="h-4 w-24 bg-slate-800" />
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="w-full h-64 flex items-center justify-center border border-red-900/50 bg-red-950/10 rounded-xl text-red-400">
                Failed to load seismic data: {error.message}
            </div>
        );
    }

    const events = data?.events || [];
    const meta = data?.meta;

    // Determine Domain (Full possible range)
    // Use metadata, or fall back to event range, or fall back to current year
    const domainMin = meta?.minDate ? new Date(meta.minDate) : new Date(2024, 0, 1);
    const domainMax = meta?.maxDate ? new Date(meta.maxDate) : new Date(); // Now

    const currentMinDate = windowRange ? new Date(windowRange[0]) : undefined;
    const currentMaxDate = windowRange ? new Date(windowRange[1]) : undefined;

    // Handlers
    const handleScrubberChange = (val: [number, number]) => {
        // Hot Update: React State only (Instant)
        setWindowRange(val);
    };

    const handleScrubberCommit = (val: [number, number]) => {
        // Cold Update: Sync to URL
        const params = new URLSearchParams(search);
        params.set("min", new Date(val[0]).toISOString());
        params.set("max", new Date(val[1]).toISOString());
        // Use wouter's navigate (setLocation) but preserve path
        // wouter's setLocation overwrites the whole path, so we need to construct it
        // Wait, wouter useLocation returns [path, navigate].
        // We need to keep the current path e.g. /compare
        setLocation(`${location}?${params.toString()}`);
    };

    return (
        <div className={`relative w-full ${className}`}>
            {/* HEADER / META INFO */}
            <div className="mb-4 flex flex-col md:flex-row justify-between items-end gap-2">
                <div>
                    <h3 className="text-lg font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        Political Seismograph
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                        DETECTED {meta?.totalCount || 0} CONFLICT EVENTS
                    </p>
                </div>

                {/* Date Range Badge */}
                {currentMinDate && currentMaxDate && (
                    <div className="text-xs font-mono text-cyan-400 bg-cyan-950/30 px-2 py-1 rounded border border-cyan-900/50">
                        {currentMinDate.toISOString().split("T")[0]} — {currentMaxDate.toISOString().split("T")[0]}
                    </div>
                )}
            </div>

            {/* CHART (Windowed) */}
            <SeismographChart
                events={events}
                minDate={currentMinDate}
                maxDate={currentMaxDate}
                onEventClick={setSelectedEvent}
                className="mb-6"
            />

            {/* SCRUBBER (Controller) */}
            {windowRange && (
                <DensityScrubber
                    events={events}
                    domain={[domainMin, domainMax]}
                    value={windowRange}
                    onChange={handleScrubberChange}
                    onCommit={handleScrubberCommit}
                    className="mb-8"
                />
            )}

            {/* DETAIL SHEET (Interactions) */}
            <DetailSheet
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
            />
        </div>
    );
}
