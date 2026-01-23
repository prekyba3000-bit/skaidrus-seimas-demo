import { useState, useEffect, lazy, Suspense } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { MPSelector } from "@/components/MPSelector";
import {
  ArrowLeftRight,
  Trophy,
  Vote,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { getPartyColors } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy-load SeismographContainer to reduce initial bundle size (Recharts is heavy ~200-300KB)
const SeismographContainer = lazy(() =>
  import("@/components/seismograph/SeismographContainer").then(m => ({
    default: m.SeismographContainer,
  }))
);

export default function MpCompare() {
  const [, setLocation] = useLocation();
  const [mp1Id, setMp1Id] = useState<number | null>(null);
  const [mp2Id, setMp2Id] = useState<number | null>(null);

  // Read URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idsParam = params.get("ids");
    if (idsParam) {
      const ids = idsParam
        .split(",")
        .map(id => parseInt(id.trim()))
        .filter(id => !isNaN(id));
      if (ids.length >= 1) setMp1Id(ids[0]);
      if (ids.length >= 2) setMp2Id(ids[1]);
    }
  }, []);

  // Update URL when MPs change
  useEffect(() => {
    if (mp1Id || mp2Id) {
      const ids = [mp1Id, mp2Id].filter(id => id !== null).join(",");
      setLocation(`/compare?ids=${ids}`, { replace: true });
    } else {
      setLocation("/compare", { replace: true });
    }
  }, [mp1Id, mp2Id, setLocation]);

  const { data: comparison, isLoading } = trpc.mps.compare.useQuery(
    { mpId1: mp1Id!, mpId2: mp2Id! },
    { enabled: !!mp1Id && !!mp2Id && mp1Id !== mp2Id }
  );

  const partyColors1 = comparison ? getPartyColors(comparison.mp1.party) : null;
  const partyColors2 = comparison ? getPartyColors(comparison.mp2.party) : null;

  return (
    <DashboardLayout title="Palyginimas">
      {/* Selection Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card className="bg-surface-dark border-surface-border">
          <CardContent className="p-6">
            <MPSelector
              value={mp1Id}
              onChange={setMp1Id}
              excludeId={mp2Id}
              label="Pasirinkite pirmą naryį"
            />
          </CardContent>
        </Card>

        <Card className="bg-surface-dark border-surface-border">
          <CardContent className="p-6">
            <MPSelector
              value={mp2Id}
              onChange={setMp2Id}
              excludeId={mp1Id}
              label="Pasirinkite antrą naryį"
            />
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[#92adc9]">Analizuojami balsavimo duomenys...</p>
        </div>
      )}

      {/* Comparison Content */}
      {comparison && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Edge Case: No Overlap */}
          {!comparison.hasOverlap && (
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardContent className="p-6 flex items-center gap-4">
                <AlertCircle className="w-6 h-6 text-amber-400" />
                <div>
                  <h3 className="text-white font-bold mb-1">
                    Nėra bendrų balsavimų
                  </h3>
                  <p className="text-[#92adc9] text-sm">
                    Šie nariai nėra balsavę dėl tų pačių įstatymų projektų. Tai
                    gali reikšti, kad jie nebuvo parlamente tuo pačiu metu arba
                    balsavo dėl skirtingų klausimų.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Profile Cards with VS Badge */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* MP 1 Profile */}
            <Link
              href={`/mp/${comparison.mp1.id}`}
              className="flex-1 w-full relative group"
            >
              <div className="absolute inset-0 bg-primary/10 rounded-xl blur-lg group-hover:bg-primary/20 transition-all"></div>
              <Card className="relative bg-surface-dark border-surface-border hover:border-primary/50 transition-colors">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <Avatar className="w-24 h-24 border-2 border-primary mb-4">
                    <AvatarImage
                      src={comparison.mp1.photoUrl || undefined}
                      className="object-cover"
                    />
                    <AvatarFallback>{comparison.mp1.name[0]}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-bold text-white">
                    {comparison.mp1.name}
                  </h3>
                  {comparison.mp1.party && (
                    <span
                      className={`text-xs px-2 py-1 rounded mt-2 ${partyColors1?.bg} ${partyColors1?.text} ${partyColors1?.border} border`}
                    >
                      {comparison.mp1.party}
                    </span>
                  )}
                </CardContent>
              </Card>
            </Link>

            {/* VS Badge */}
            <div className="bg-primary text-black font-black text-2xl w-16 h-16 rounded-full flex items-center justify-center shrink-0 z-10 shadow-lg">
              VS
            </div>

            {/* MP 2 Profile */}
            <Link
              href={`/mp/${comparison.mp2.id}`}
              className="flex-1 w-full relative group"
            >
              <div className="absolute inset-0 bg-blue-500/10 rounded-xl blur-lg group-hover:bg-blue-500/20 transition-all"></div>
              <Card className="relative bg-surface-dark border-surface-border hover:border-blue-500/50 transition-colors">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <Avatar className="w-24 h-24 border-2 border-blue-500 mb-4">
                    <AvatarImage
                      src={comparison.mp2.photoUrl || undefined}
                      className="object-cover"
                    />
                    <AvatarFallback>{comparison.mp2.name[0]}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-bold text-white">
                    {comparison.mp2.name}
                  </h3>
                  {comparison.mp2.party && (
                    <span
                      className={`text-xs px-2 py-1 rounded mt-2 ${partyColors2?.bg} ${partyColors2?.text} ${partyColors2?.border} border`}
                    >
                      {comparison.mp2.party}
                    </span>
                  )}
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Agreement Score Card */}
          {comparison.agreementScore !== null && (
            <Card className="bg-surface-dark border-surface-border overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-500"></div>
              <CardContent className="p-8 text-center">
                <h2 className="text-sm uppercase tracking-widest text-[#92adc9] mb-2">
                  Balsavimo Sutikimas
                </h2>
                <div className="relative inline-flex items-center justify-center">
                  <span className="text-6xl font-black text-white tracking-tighter">
                    {comparison.agreementScore.toFixed(0)}%
                  </span>
                </div>
                <p className="text-sm text-[#92adc9] mt-2">
                  Jie balsavo vienodai{" "}
                  <span className="text-white font-bold">
                    {comparison.commonVotes - comparison.disagreements.length}
                  </span>{" "}
                  iš{" "}
                  <span className="text-white font-bold">
                    {comparison.commonVotes}
                  </span>{" "}
                  bendrų balsavimų.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Political Seismograph - Visual History of Conflicts */}
          <Card className="bg-surface-dark border-surface-border overflow-hidden">
            <CardContent className="p-6">
              <Suspense
                fallback={
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-[#92adc9]">
                      Kraunama seismografas...
                    </p>
                    <Skeleton className="h-64 w-full rounded-xl" />
                  </div>
                }
              >
                <SeismographContainer
                  mpAId={mp1Id!}
                  mpBId={mp2Id!}
                  className="w-full"
                />
              </Suspense>
            </CardContent>
          </Card>

          {/* Key Disagreements */}
          {comparison.disagreements.length > 0 && (
            <Card className="bg-surface-dark border-surface-border">
              <CardContent className="p-6">
                <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  Pagrindiniai Nesutarimai
                </h3>
                <div className="space-y-3">
                  {comparison.disagreements.map((disagreement: { billId: number; billTitle: string; mp1Vote: string; mp2Vote: string; votedAt: Date | string | null }) => (
                    <Link
                      key={disagreement.billId}
                      href={`/bills/${disagreement.billId}`}
                      className="block p-4 rounded-lg bg-[#233648] hover:bg-[#2d455d] transition-colors border border-surface-border"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium mb-2 truncate">
                            {disagreement.billTitle}
                          </h4>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-[#92adc9]">
                              {comparison.mp1.name}:{" "}
                              <span className="text-white font-bold">
                                {formatVote(disagreement.mp1Vote)}
                              </span>
                            </span>
                            <span className="text-[#92adc9]">vs</span>
                            <span className="text-[#92adc9]">
                              {comparison.mp2.name}:{" "}
                              <span className="text-white font-bold">
                                {formatVote(disagreement.mp2Vote)}
                              </span>
                            </span>
                          </div>
                        </div>
                        {disagreement.votedAt && (
                          <span className="text-xs text-[#92adc9] whitespace-nowrap">
                            {new Date(disagreement.votedAt).toLocaleDateString(
                              "lt-LT"
                            )}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stat Comparison Table */}
          <div className="grid gap-4">
            <ComparisonRow
              label="Atskaitomybės balas"
              icon={<Trophy className="w-4 h-4 text-yellow-500" />}
              val1={comparison.mp1.stats?.accountabilityScore}
              val2={comparison.mp2.stats?.accountabilityScore}
              suffix=""
            />
            <ComparisonRow
              label="Balsavimo lankomumas"
              icon={<Vote className="w-4 h-4 text-green-500" />}
              val1={comparison.mp1.stats?.votingAttendance}
              val2={comparison.mp2.stats?.votingAttendance}
              suffix="%"
            />
            <ComparisonRow
              label="Partijos lojalumas"
              icon={<CheckCircle2 className="w-4 h-4 text-blue-500" />}
              val1={comparison.mp1.stats?.partyLoyalty}
              val2={comparison.mp2.stats?.partyLoyalty}
              suffix="%"
            />
            <ComparisonRow
              label="Pateikta projektų"
              icon={<FileText className="w-4 h-4 text-purple-500" />}
              val1={comparison.mp1.stats?.billsProposed}
              val2={comparison.mp2.stats?.billsProposed}
              suffix=""
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!mp1Id || !mp2Id) && !isLoading && (
        <div className="text-center py-20 opacity-50">
          <ArrowLeftRight className="w-16 h-16 mx-auto mb-4 text-[#92adc9]" />
          <h3 className="text-xl font-bold text-white">
            Pasirinkite narius palyginti
          </h3>
          <p className="text-[#92adc9]">
            Pasirinkite du Seimo narius, kad pamatytumėte, kaip jie sutinka.
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}

function ComparisonRow({
  label,
  icon,
  val1,
  val2,
  suffix,
}: {
  label: string;
  icon: React.ReactNode;
  val1: number | string | null | undefined;
  val2: number | string | null | undefined;
  suffix: string;
}) {
  const v1 = parseFloat(String(val1 || "0"));
  const v2 = parseFloat(String(val2 || "0"));

  // Determine winner color
  const win1 = v1 > v2;
  const win2 = v2 > v1;

  return (
    <Card className="bg-surface-dark border-surface-border overflow-hidden">
      <CardContent className="p-4 grid grid-cols-[1fr_auto_1fr] md:grid-cols-[1fr_150px_1fr] items-center gap-4 relative z-10">
        {/* Left Value */}
        <div
          className={`text-right ${win1 ? "text-primary font-bold" : "text-white"}`}
        >
          <span className="text-xl">
            {Number.isInteger(v1) ? v1 : v1.toFixed(1)}
            {suffix}
          </span>
        </div>

        {/* Center Label */}
        <div className="flex flex-col items-center justify-center text-center px-2">
          <div className="mb-1 opacity-80">{icon}</div>
          <span className="text-xs text-[#92adc9] uppercase font-medium">
            {label}
          </span>
        </div>

        {/* Right Value */}
        <div
          className={`text-left ${win2 ? "text-blue-500 font-bold" : "text-white"}`}
        >
          <span className="text-xl">
            {Number.isInteger(v2) ? v2 : v2.toFixed(1)}
            {suffix}
          </span>
        </div>
      </CardContent>
      {/* Visual Bar at bottom */}
      <div className="h-1 w-full bg-[#1A2633] flex">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ flex: v1 }} // eslint-disable-line
        ></div>
        <div
          className="h-full bg-blue-500 transition-all duration-500"
          style={{ flex: v2 }} // eslint-disable-line
        ></div>
      </div>
    </Card>
  );
}

function formatVote(voteValue: string): string {
  const voteMap: Record<string, string> = {
    for: "Už",
    against: "Prieš",
    abstain: "Susilaikė",
    absent: "Nedalyvavo",
  };
  return voteMap[voteValue.toLowerCase()] || voteValue;
}
