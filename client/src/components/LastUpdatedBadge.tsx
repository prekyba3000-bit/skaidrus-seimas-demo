import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface LastUpdatedBadgeProps {
  className?: string;
}

/**
 * Last Updated Badge Component
 * Displays when data was last synced with a relative time (e.g., "2 hours ago")
 */
export function LastUpdatedBadge({ className }: LastUpdatedBadgeProps) {
  const { data, isLoading } = trpc.stats.getLastUpdated.useQuery(undefined, {
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });

  if (isLoading) {
    return (
      <div
        className={`flex items-center gap-2 text-xs text-[#92adc9] ${className}`}
      >
        <Clock className="w-3 h-3" />
        <Skeleton className="h-3 w-24" />
      </div>
    );
  }

  if (!data?.overall) {
    return null; // Don't show badge if no data available
  }

  const lastUpdated = new Date(data.overall);
  const relativeTime = formatDistanceToNow(lastUpdated, {
    addSuffix: true,
  });

  return (
    <div
      className={`flex items-center gap-2 text-xs text-[#92adc9] ${className}`}
      title={`Duomenys atnaujinti: ${lastUpdated.toLocaleString("lt-LT")}`}
    >
      <Clock className="w-3 h-3" />
      <span>Duomenys atnaujinti: {relativeTime}</span>
    </div>
  );
}
