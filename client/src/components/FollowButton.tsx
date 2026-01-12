import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  mpId: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function FollowButton({ mpId, className, size = "md" }: FollowButtonProps) {
  const utils = trpc.useUtils();
  const [isOptimistic, setIsOptimistic] = useState(false);

  // Check current follow status (userId now comes from authenticated context)
  const { data: isFollowing, isLoading } = trpc.user.isFollowingMp.useQuery(
    { mpId },
    { staleTime: 30000 } // Cache for 30 seconds
  );

  // Toggle follow mutation with optimistic updates
  const toggleFollow = trpc.user.toggleFollowMp.useMutation({
    onMutate: async () => {
      // Cancel outgoing refetches
      await utils.user.isFollowingMp.cancel({ mpId });
      await utils.user.getWatchlist.cancel();

      // Snapshot previous values
      const previousIsFollowing = utils.user.isFollowingMp.getData({ mpId });
      const previousWatchlist = utils.user.getWatchlist.getData();

      // Optimistically update
      setIsOptimistic(true);
      utils.user.isFollowingMp.setData({ mpId }, !previousIsFollowing);
      
      // Optimistically update watchlist if needed
      if (!previousIsFollowing) {
        // Adding to watchlist - we'd need MP data, so just invalidate
        utils.user.getWatchlist.invalidate();
      } else {
        // Removing from watchlist - remove from cache
        const currentWatchlist = previousWatchlist || [];
        utils.user.getWatchlist.setData(
          currentWatchlist.filter((mp: any) => mp.id !== mpId)
        );
      }

      return { previousIsFollowing, previousWatchlist };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousIsFollowing !== undefined) {
        utils.user.isFollowingMp.setData(
          { mpId },
          context.previousIsFollowing
        );
      }
      if (context?.previousWatchlist) {
        utils.user.getWatchlist.setData(context.previousWatchlist);
      }
      setIsOptimistic(false);
    },
    onSuccess: () => {
      setIsOptimistic(false);
    },
    onSettled: () => {
      // Refetch to ensure consistency
      utils.user.isFollowingMp.invalidate({ mpId });
      utils.user.getWatchlist.invalidate();
    },
  });

  const handleToggle = () => {
    toggleFollow.mutate({ mpId });
  };

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={isLoading || isOptimistic}
      className={cn(
        sizeClasses[size],
        "transition-all",
        isFollowing
          ? "text-red-400 hover:text-red-300 hover:bg-red-500/10"
          : "text-[#92adc9] hover:text-red-400 hover:bg-red-500/10",
        className
      )}
      aria-label={isFollowing ? "Nebesekti" : "Sekti"}
    >
      <Heart
        className={cn(
          "transition-all",
          isFollowing ? "fill-current" : "fill-none",
          isOptimistic && "animate-pulse"
        )}
      />
    </Button>
  );
}
