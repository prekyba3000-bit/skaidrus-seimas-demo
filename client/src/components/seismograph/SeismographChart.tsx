import { useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
    ReferenceLine,
} from "recharts";
import { format } from "date-fns";
import { lt } from "date-fns/locale";
import { filterVisibleEvents } from "./utils/windowing";

export interface SeismicEvent {
    id: number;
    date: string; // ISO string
    question: string;
    margin: number;
    votedFor: number;
    votedAgainst: number;
    abstain: number;
    totalVoted: number;
    mpAVote: string;
    mpBVote: string;
}

interface SeismographChartProps {
    events: SeismicEvent[];
    minDate?: Date; // Viewport Start
    maxDate?: Date; // Viewport End
    onEventClick?: (event: SeismicEvent) => void;
    className?: string; // For container styling
}

export function SeismographChart({
    events,
    minDate,
    maxDate,
    onEventClick,
    className,
}: SeismographChartProps) {
    // 1. WINDOWING & OPTIMIZATION LOGIC
    const visibleData = useMemo(() => {
        return filterVisibleEvents(events, {
            minDate: minDate || new Date(0), // Fallback to epoch if undefined
            maxDate: maxDate || new Date(),
            maxNodes: 200,
        });
    }, [events, minDate, maxDate]);

    // If no data, show empty state
    if (!events.length) {
        return (
            <div className="h-64 flex items-center justify-center text-slate-400 font-mono text-sm border border-slate-800 rounded-lg bg-slate-900/50">
                NO SEISMIC ACTIVITY DETECTED
            </div>
        );
    }

    return (
        <div className={`w-full h-64 ${className}`}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={visibleData}
                    margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                    barCategoryGap={1} // Tighter bars for "Spike" look
                >
                    <XAxis
                        dataKey="dateObj"
                        type="number"
                        domain={[
                            minDate ? minDate.getTime() : "auto",
                            maxDate ? maxDate.getTime() : "auto"
                        ]}
                        scale="time"
                        tickFormatter={(time) => format(new Date(time), "MMM yyyy")}
                        stroke="#64748b"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        allowDataOverflow // Important for windowing!
                    />
                    {/* Y-Axis Hidden - visual only */}
                    <YAxis
                        type="number"
                        domain={[0, 'dataMax']}
                        hide
                    />

                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0].payload as SeismicEvent & { magnitude: number };
                                return (
                                    <div className="bg-slate-900/90 border border-slate-700 p-3 rounded-lg shadow-xl backdrop-blur-md text-xs">
                                        <p className="font-bold text-slate-200 mb-1">
                                            {format(new Date(data.date), "PPP", { locale: lt })}
                                        </p>
                                        <p className="text-cyan-400 font-mono mb-2 truncate max-w-[200px]">
                                            {data.question}
                                        </p>
                                        <div className="flex justify-between gap-4 text-slate-400">
                                            <span>Margin: <span className="text-white">{data.margin}</span></span>
                                            <span>Total: <span className="text-white">{data.totalVoted}</span></span>
                                        </div>
                                        <div className="mt-2 flex gap-2 border-t border-slate-700 pt-2">
                                            <span className="text-red-400">A: {data.mpAVote}</span>
                                            <span className="text-blue-400">B: {data.mpBVote}</span>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        }}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    />

                    {/* The Spikes: Using Bar with very small size */}
                    <Bar
                        dataKey="magnitude"
                        onClick={(data) => onEventClick?.(data)}
                        className="cursor-pointer transition-opacity hover:opacity-80"
                        maxBarSize={4} // Thin bars = Spikes
                    >
                        {visibleData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.magnitude > 10 ? "#ef4444" : "#f97316"} // Red for high conflict, Orange for med
                                fillOpacity={0.8}
                            />
                        ))}
                    </Bar>

                    {/* Baseline */}
                    <ReferenceLine y={0} stroke="#334155" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
