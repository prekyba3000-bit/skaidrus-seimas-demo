import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight, Heart } from "lucide-react";
import { getPartyColors } from "@/lib/constants";
import { Skeleton, SkeletonAvatar } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

export function WatchlistWidget() {
  // userId now comes from authenticated context - no need to pass it
  const { data: watchlist, isLoading } = trpc.watchlist.get.useQuery(
    undefined,
    {
      staleTime: 30000,
    }
  );

  if (isLoading) {
    return (
      <Card className="bg-surface-dark border-surface-border">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-400" />
            Mano sekami
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <SkeletonAvatar size={40} />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!watchlist || watchlist.length === 0) {
    return (
      <Card className="bg-surface-dark border-surface-border">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-400" />
            Mano sekami
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Heart}
            title="Jūs dar nesekate jokių Seimo narių"
            description="Pradėkite sekti Seimo narius, kad matytumėte jų veiklą savo apžvalgoje."
            actionButton={{
              label: "Peržiūrėti narius",
              onClick: () => (window.location.href = "/"),
            }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-surface-dark border-surface-border">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-400 fill-current" />
          Mano sekami
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {watchlist.slice(0, 5).map(item => {
            const mp = item.mp;
            const bill = item.bill;
            const partyColors = mp ? getPartyColors(mp.party) : undefined;
            const href = mp ? `/mp/${mp.id}` : bill ? `/bills/${bill.id}` : "#";
            const title = mp ? mp.name : bill ? bill.title : "Nenurodyta";
            const subtitle = mp
              ? mp.party
              : bill?.status
                ? `Būsena: ${bill.status}`
                : undefined;
            return (
              <Link
                key={item.id}
                href={href}
                className="flex items-center gap-3 p-3 rounded-lg bg-[#233648] hover:bg-[#2d455d] transition-colors group"
              >
                <Avatar className="w-10 h-10 border-2 border-surface-border group-hover:border-primary transition-colors">
                  <AvatarImage src={mp?.photoUrl || undefined} />
                  <AvatarFallback>{title[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {title}
                  </p>
                  {subtitle && (
                    <p
                      className={`text-xs truncate ${partyColors?.text ?? "text-[#92adc9]"}`}
                    >
                      {subtitle}
                    </p>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-[#92adc9] group-hover:text-primary transition-colors" />
              </Link>
            );
          })}
          {watchlist.length > 5 && (
            <div className="block text-center pt-2">
              <button className="text-[#92adc9] text-xs hover:text-primary transition-colors">
                + {watchlist.length - 5} daugiau
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
