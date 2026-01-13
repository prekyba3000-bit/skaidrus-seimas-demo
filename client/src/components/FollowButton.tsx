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

export function FollowButton({
  mpId,
  className,
  size = "md",
}: FollowButtonProps) {
  const utils = trpc.useUtils();
  const [isOptimistic, setIsOptimistic] = useState(false);

  const { data: watchlist, isLoading } = trpc.watchlist.get.useQuery(
    undefined,
    {
      staleTime: 30000,
    }
  );

  const currentEntry = watchlist?.find(item => item.mp?.id === mpId);
  const isFollowing = !!currentEntry;

  const addToWatchlist = trpc.watchlist.add.useMutation({
    onMutate: async () => {
      await utils.watchlist.get.cancel();
      const previous = utils.watchlist.get.getData();
      setIsOptimistic(true);
      utils.watchlist.get.setData(
        (previous ?? []).concat({
          id: Math.random(), // optimistic id
          createdAt: new Date().toISOString(),
          mp: currentEntry?.mp ?? {
            id: mpId,
            name: "MP",
            party: "",
            photoUrl: "",
          },
          bill: null,
        } as any)
      );
      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) utils.watchlist.get.setData(context.previous);
      setIsOptimistic(false);
    },
    onSuccess: () => {
      setIsOptimistic(false);
    },
    onSettled: () => {
      utils.watchlist.get.invalidate();
    },
  });

  const removeFromWatchlist = trpc.watchlist.remove.useMutation({
    onMutate: async () => {
      await utils.watchlist.get.cancel();
      const previous = utils.watchlist.get.getData();
      setIsOptimistic(true);
      if (previous && currentEntry) {
        utils.watchlist.get.setData(
          previous.filter(item => item.id !== currentEntry.id)
        );
      }
      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) utils.watchlist.get.setData(context.previous);
      setIsOptimistic(false);
    },
    onSuccess: () => {
      setIsOptimistic(false);
    },
    onSettled: () => {
      utils.watchlist.get.invalidate();
    },
  });

  const handleToggle = () => {
    if (currentEntry) {
      removeFromWatchlist.mutate({ id: currentEntry.id });
    } else {
      addToWatchlist.mutate({ mpId });
    }
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
