import { useState } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

interface FollowBillButtonProps {
  billId: number;
  billTitle: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "outline";
}

export function FollowBillButton({
  billId,
  billTitle,
  className,
  size = "sm",
  variant = "outline",
}: FollowBillButtonProps) {
  const utils = trpc.useUtils();
  const [isOptimistic, setIsOptimistic] = useState(false);

  const { data: watchlist, isLoading, isError } = trpc.watchlist.get.useQuery(
    undefined,
    {
      staleTime: 30000,
      retry: false,
    }
  );

  const currentEntry = watchlist?.find(item => item.bill?.id === billId);
  const isFollowing = !!currentEntry;

  const addToWatchlist = trpc.watchlist.add.useMutation({
    onMutate: async () => {
      await utils.watchlist.get.cancel();
      const previous = utils.watchlist.get.getData();
      setIsOptimistic(true);
      utils.watchlist.get.setData(
        (previous ?? []).concat({
          id: Math.random(),
          createdAt: new Date().toISOString(),
          mp: null,
          bill: { id: billId, title: billTitle, status: "" },
        } as any)
      );
      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) utils.watchlist.get.setData(context.previous);
      setIsOptimistic(false);
    },
    onSuccess: () => setIsOptimistic(false),
    onSettled: () => utils.watchlist.get.invalidate(),
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
    onSuccess: () => setIsOptimistic(false),
    onSettled: () => utils.watchlist.get.invalidate(),
  });

  const handleToggle = () => {
    if (currentEntry) {
      removeFromWatchlist.mutate({ id: currentEntry.id });
    } else {
      addToWatchlist.mutate({ billId });
    }
  };

  if (isError) return null;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={isLoading || isOptimistic}
      className={cn(
        "transition-all",
        isFollowing
          ? "border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
          : "border-[var(--amber-start)]/30 hover:bg-[var(--amber-start)]/10 hover:border-[var(--amber-start)]/50",
        className
      )}
      aria-label={isFollowing ? "Nebesekti projekto" : "Sekti projektą"}
    >
      <Bookmark
        className={cn(
          "h-4 w-4 mr-2 transition-all",
          isFollowing ? "fill-current" : "fill-none",
          isOptimistic && "animate-pulse"
        )}
      />
      {isFollowing ? "Stebima" : "Sekti"}
    </Button>
  );
}
