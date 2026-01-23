import { useRoute, Link } from "wouter";
import { ArrowLeft, Users2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Skeleton,
  SkeletonHeader,
  SkeletonAvatar,
  SkeletonCard,
} from "@/components/ui/skeleton";
import { getPartyColors } from "@/lib/constants";

export default function CommitteeDetail() {
  const [, params] = useRoute("/committees/:id");
  const id = params?.id ? parseInt(params.id, 10) : null;

  const { data: committee, isLoading: committeeLoading } =
    trpc.committees.byId.useQuery(
      { id: id! },
      { enabled: !!id && !isNaN(id) }
    );

  const { data: members, isLoading: membersLoading } =
    trpc.committees.members.useQuery(
      { committeeId: id! },
      { enabled: !!id && !isNaN(id) }
    );

  const isLoading = committeeLoading || !committee;

  if (!id || isNaN(id)) {
    return (
      <DashboardLayout title="Komitetas">
        <div className="text-center py-12">
          <p className="text-red-400">Neteisingas komiteto ID.</p>
          <Link href="/committees">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Grįžti į komitetus
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout title="Komitetas">
        <div className="space-y-6">
          <SkeletonHeader />
          <SkeletonCard className="h-32" />
          <div className="grid gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={committee.name}>
      <div className="space-y-6">
        <Link href="/committees">
          <Button
            variant="ghost"
            size="sm"
            className="text-[#92adc9] hover:text-white -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Visi komitetai
          </Button>
        </Link>

        <div className="gemstone-card rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="size-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Users2 className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-white text-2xl sm:text-3xl font-bold tracking-tight">
                {committee.name}
              </h1>
              {committee.description && (
                <p className="text-[#92adc9] mt-2 leading-relaxed">
                  {committee.description}
                </p>
              )}
            </div>
          </div>
        </div>

        <Card className="bg-surface-dark border-surface-border">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Nariai ({members?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {membersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-lg bg-[#1b2a38]"
                  >
                    <SkeletonAvatar size={40} />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !members?.length ? (
              <div className="text-center py-12 text-[#92adc9]">
                <Users2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Narių duomenų nėra</p>
                <p className="text-sm mt-1">
                  Paleiskite <code className="text-primary">sync:committees</code>{" "}
                  ir importuokite komiteto narius.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {members.map(({ member, mp }) => {
                  const partyColors = getPartyColors(mp?.party ?? null);
                  return (
                    <Link
                      key={member.id}
                      href={mp ? `/mp/${mp.id}` : "#"}
                      className="block"
                    >
                      <div className="flex items-center gap-4 p-3 rounded-lg bg-[#1b2a38] hover:bg-[#233648] border border-transparent hover:border-primary/20 transition-all">
                        <Avatar className="size-10 shrink-0">
                          <AvatarImage
                            src={mp?.photoUrl ?? undefined}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-emerald-900/50 text-primary text-sm">
                            {mp?.name?.[0] ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">
                            {mp?.name ?? "Nežinomas narys"}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {mp?.party && (
                              <span
                                className={`text-xs px-2 py-0.5 rounded ${partyColors.bg} ${partyColors.text} ${partyColors.border} border`}
                              >
                                {mp.party}
                              </span>
                            )}
                            {member.role && (
                              <span className="text-xs text-[#92adc9]">
                                {member.role}
                              </span>
                            )}
                          </div>
                        </div>
                        {mp && (
                          <ChevronRight className="w-5 h-5 text-[#92adc9] shrink-0" />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
