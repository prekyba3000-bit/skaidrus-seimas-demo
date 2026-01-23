import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FeedItem } from "./FeedItem";
import { trpc } from "@/lib/trpc";
import { Loader2, RefreshCw, AlertCircle, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

interface ActivityFeedProps {
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export function ActivityFeed({
  limit = 20,
  autoRefresh = true,
  refreshInterval = 5000,
  className,
}: ActivityFeedProps) {
  const [allActivities, setAllActivities] = useState<any[]>([]);
  const [hideRead, setHideRead] = useState(false);

  // Fetch activities with cursor-based pagination (use getFeed for better performance)
  const {
    data: feedData,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = trpc.activities.getFeed.useInfiniteQuery(
    { limit, excludeRead: hideRead },
    {
      getNextPageParam: lastPage => lastPage.nextCursor,
      refetchInterval: autoRefresh ? refreshInterval : false,
      refetchIntervalInBackground: false,
    }
  );

  // Extract activities from paginated response
  const activities = feedData?.pages.flatMap(page => page.items) || [];

  // Update all activities when new data arrives
  useEffect(() => {
    if (activities && activities.length > 0) {
      setAllActivities(activities);
    } else if (!isLoading && activities.length === 0) {
      setAllActivities([]);
    }
  }, [activities, isLoading]);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isError) {
    return (
      <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-6 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-rose-400 mb-3" />
        <h3 className="text-lg font-semibold text-rose-300 mb-2">
          Nepavyko įkelti aktyvumo
        </h3>
        <p className="text-sm text-rose-200 mb-4">
          {error?.message || "Įvyko klaida užkraunant duomenis"}
        </p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 rounded-lg bg-rose-500/20 px-4 py-2 text-sm font-medium text-rose-300 hover:bg-rose-500/30 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Bandyti dar kartą
        </button>
      </div>
    );
  }

  if (isLoading && allActivities.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  if (!isLoading && allActivities.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="Aktyvumo nėra"
        description="Naujų veiklų dar nepasirodo. Pabandykite vėliau."
      />
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">Aktyvumo srautas</h2>
          <p className="text-sm text-gray-400 mt-1">
            Real-time Seimo narių veiklos
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Hide Read Toggle */}
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={hideRead}
              onChange={(e) => setHideRead(e.target.checked)}
              className="w-4 h-4 rounded border-surface-border bg-surface-dark text-primary focus:ring-2 focus:ring-primary/50 cursor-pointer"
            />
            <span>Slėpti perskaitytus</span>
          </label>

          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Atnaujinti
          </button>
        </div>
      </div>

      {/* Activity Feed */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
        role="feed"
        aria-label="Parliamentary activity feed"
        aria-live="polite"
        aria-busy={isLoading}
      >
        {allActivities.map((activity, index) => (
          <FeedItem
            key={activity.activity?.id || index}
            activity={activity}
            isNew={activity.activity?.isNew}
          />
        ))}
      </motion.div>

      {/* Load More Button */}
      {hasNextPage && (
        <div className="mt-6 text-center">
          <button
            onClick={handleLoadMore}
            disabled={isFetchingNextPage}
            className="inline-flex items-center gap-2 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Kraunama...
              </>
            ) : (
              "Įkelti daugiau"
            )}
          </button>
        </div>
      )}

      {/* Auto-refresh indicator */}
      {autoRefresh && (
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          Automatiškai atnaujinama kas {refreshInterval / 1000}s
        </div>
      )}
    </div>
  );
}
