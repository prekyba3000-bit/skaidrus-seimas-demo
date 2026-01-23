import { useState, useMemo } from "react";
import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Users,
  Users2,
  CheckCircle2,
  XCircle,
  MinusCircle,
  UserX,
  Sparkles,
  Share2,
  Download,
  ScrollText,
  AlertTriangle,
  Vote,
  Scale,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { trpc } from "@/lib/trpc";
import { FollowBillButton } from "@/components/FollowBillButton";

const statusConfig = {
  proposed: {
    label: "Pateiktas",
    color:
      "text-[var(--foreground)] border-[var(--amber-start)]/50 bg-[var(--amber-start)]/10",
  },
  voted: {
    label: "Balsuota",
    color:
      "text-[var(--amber-end)] border-[var(--amber-end)]/50 bg-[var(--amber-end)]/10",
  },
  passed: {
    label: "Priimtas",
    color:
      "text-[var(--copper-moss)] border-[var(--copper-moss)]/50 bg-[var(--copper-moss)]/10",
  },
  rejected: {
    label: "Atmestas",
    color:
      "text-[var(--destructive)] border-[var(--destructive)]/50 bg-[var(--destructive)]/10",
  },
};

const voteConfig = {
  for: {
    label: "Už",
    icon: CheckCircle2,
    color: "text-[var(--copper-moss)]",
  },
  against: {
    label: "Prieš",
    icon: XCircle,
    color: "text-[var(--destructive)]",
  },
  abstain: {
    label: "Susilaikė",
    icon: MinusCircle,
    color: "text-[var(--amber-end)]",
  },
  absent: {
    label: "Nedalyvavo",
    icon: UserX,
    color: "text-[var(--muted-foreground)]",
  },
};

type ActiveVote = "for" | "against" | "abstain";

const VALUE_MAP: Record<string, ActiveVote | "absent"> = {
  for: "for",
  against: "against",
  abstain: "abstain",
  absent: "absent",
  už: "for",
  prieš: "against",
  susilaikė: "abstain",
  nebalsavo: "absent",
  nedalyvavo: "absent",
};

function normalizeVote(v: string): ActiveVote | "absent" {
  const key = v?.toLowerCase().trim();
  return VALUE_MAP[key] ?? "absent";
}

function getPartyMajority(
  data: Array<{ vote: { voteValue: string }; mp: { party: string | null } | null }>
): Map<string, ActiveVote> {
  const byParty = new Map<string, { for: number; against: number; abstain: number }>();
  for (const { vote, mp } of data) {
    const n = normalizeVote(vote.voteValue);
    if (n === "absent" || !mp?.party) continue;
    const p = mp.party;
    if (!byParty.has(p)) byParty.set(p, { for: 0, against: 0, abstain: 0 });
    const counts = byParty.get(p)!;
    if (n === "for") counts.for++;
    else if (n === "against") counts.against++;
    else counts.abstain++;
  }
  const out = new Map<string, ActiveVote>();
  byParty.forEach((counts, party) => {
    const { for: f, against: a, abstain: ab } = counts;
    if (f + a + ab === 0) return;
    const max = Math.max(f, a, ab);
    if (f >= max) out.set(party, "for");
    else if (a >= max) out.set(party, "against");
    else out.set(party, "abstain");
  });
  return out;
}

function isBreakingWithParty(
  mp: { party: string | null },
  voteValue: string,
  majority: Map<string, ActiveVote>
): boolean {
  const n = normalizeVote(voteValue);
  if (n === "absent" || !mp.party) return false;
  const maj = majority.get(mp.party);
  return maj != null && n !== maj;
}

type BillTimelineProps = {
  submittedAt: Date | string | null;
  votedAt: Date | string | null;
  createdAt?: Date | string | null;
  status: string;
  formatDate: (d: Date | string | null) => string;
};

function BillTimeline({
  submittedAt,
  votedAt,
  createdAt,
  status,
  formatDate,
}: BillTimelineProps) {
  const proposed = submittedAt ?? createdAt ?? null;
  const voted = votedAt ?? null;
  const hasVote = !!voted;
  const isPassed = status === "passed";
  const isRejected = status === "rejected";
  const showResult = isPassed || isRejected;

  const steps: Array<{
    key: string;
    label: string;
    sublabel?: string;
    date: string;
    icon: typeof FileText;
    color: string;
    done: boolean;
    current: boolean;
  }> = [
    {
      key: "proposal",
      label: "Pateikta",
      date: formatDate(proposed),
      icon: FileText,
      color: "text-[var(--amber-start)]",
      done: true,
      current: false,
    },
    {
      key: "committee",
      label: "Komitete",
      sublabel: "Svarstymas",
      date: "—",
      icon: Users2,
      color: "text-[var(--amber-end)]",
      done: hasVote || showResult,
      current: !hasVote,
    },
    {
      key: "vote",
      label: "Balsuota",
      date: formatDate(voted),
      icon: Vote,
      color: "text-[var(--amber-end)]",
      done: hasVote,
      current: hasVote && !showResult,
    },
    ...(showResult
      ? [
          {
            key: "result",
            label: isPassed ? "Priimtas" : "Atmestas",
            sublabel: isPassed ? "Įstatymas" : undefined,
            date: formatDate(voted),
            icon: (isPassed ? CheckCircle2 : XCircle) as typeof FileText,
            color: isPassed
              ? "text-[var(--copper-moss)]"
              : "text-[var(--destructive)]",
            done: true,
            current: true,
          },
        ]
      : []),
  ];

  return (
    <div className="relative pl-2">
      <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-[var(--amber-start)]/20 rounded-full" />
      <div className="space-y-6">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={step.key} className="relative flex gap-4 pl-8">
              <div
                className={`absolute left-0 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                  step.current
                    ? "border-[var(--amber-start)] bg-[var(--amber-start)]/20"
                    : step.done
                      ? "border-[var(--copper-moss)]/50 bg-[var(--copper-moss)]/10"
                      : "border-[var(--muted)] bg-[var(--card)]"
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 ${
                    step.current
                      ? "text-[var(--amber-start)]"
                      : step.done
                        ? "text-[var(--copper-moss)]"
                        : "text-[var(--muted-foreground)]"
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0 pb-2">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span
                    className={`font-bold uppercase tracking-wide ${
                      step.current ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    {step.label}
                  </span>
                  {step.sublabel && (
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {step.sublabel}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
                  {step.date}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BillDetail() {
  const params = useParams();
  const billId = parseInt(params.id || "0");
  const [selectedParty, setSelectedParty] = useState<string>("all");
  const [showOnlyBreaking, setShowOnlyBreaking] = useState(false);

  // Fetch bill details
  const {
    data: bill,
    isLoading: billLoading,
    isError,
  } = trpc.bills.byId.useQuery({
    id: billId,
  });

  // Fetch voting records
  const { data: votingData, isLoading: votesLoading } =
    trpc.votes.byBill.useQuery({ billId });

  if (billLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center font-serif">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-[var(--amber-start)] border-t-transparent animate-spin mb-6 mx-auto" />
          <p className="text-[var(--amber-end)] tracking-widest uppercase animate-pulse">
            Kraunama...
          </p>
        </div>
      </div>
    );
  }

  if (!bill || isError) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="border border-muted rounded-lg p-4">
          <div className="p-8 text-center bg-[var(--card)]/90 max-w-md">
            <FileText className="h-12 w-12 text-[var(--muted-foreground)] mx-auto mb-4" />
            <h2 className="text-xl font-bold font-serif mb-2">
              Įstatymo projektas nerastas
            </h2>
            <p className="text-[var(--muted-foreground)] mb-6">
              Nurodytas įstatymo projektas neegzistuoja arba buvo pašalintas
            </p>
            <Link href="/bills">
              <Button className="bg-[var(--amber-end)] hover:bg-[var(--amber-start)] text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Grįžti į sąrašą
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate voting statistics (normalize values: už→for, prieš→against, etc.)
  const voteStats = votingData?.reduce(
    (acc, { vote }) => {
      if (vote) {
        const k = normalizeVote(vote.voteValue) as keyof typeof acc;
        acc[k] = (acc[k] ?? 0) + 1;
      }
      return acc;
    },
    { for: 0, against: 0, abstain: 0, absent: 0 }
  ) || { for: 0, against: 0, abstain: 0, absent: 0 };

  const totalVotes =
    voteStats.for + voteStats.against + voteStats.abstain + voteStats.absent;
  const activeVotes = voteStats.for + voteStats.against + voteStats.abstain;

  // Get unique parties
  const uniqueParties = new Set(
    votingData?.map(v => v.mp?.party).filter(Boolean) || []
  );
  const parties = ["all", ...Array.from(uniqueParties)];

  const partyMajority = useMemo(
    () => getPartyMajority(votingData ?? []),
    [votingData]
  );

  let filteredVotes =
    selectedParty === "all"
      ? votingData
      : votingData?.filter(v => v.mp?.party === selectedParty);
  if (showOnlyBreaking && filteredVotes) {
    filteredVotes = filteredVotes.filter(({ vote, mp }) =>
      mp && vote ? isBreakingWithParty(mp, vote.voteValue, partyMajority) : false
    );
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("lt-LT", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const statusStyle =
    statusConfig[bill.status as keyof typeof statusConfig]?.color || "";
  const statusLabel =
    statusConfig[bill.status as keyof typeof statusConfig]?.label ||
    bill.status;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-serif relative pb-32">
      <div className="grain-overlay" />
      <div className="fixed inset-0 baltic-pattern-bg pointer-events-none" />

      {/* Header */}
      <div className="border-b border-[var(--amber-start)]/20 bg-[var(--background)]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container py-6">
          <Link href="/bills">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 text-[var(--muted-foreground)] hover:text-[var(--amber-end)] hover:bg-[var(--amber-start)]/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Grįžti į sąrašą
            </Button>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge
                  variant="outline"
                  className="border-[var(--amber-start)]/30 text-[var(--muted-foreground)]"
                >
                  {bill.category}
                </Badge>
                <Badge className={`${statusStyle} border`}>{statusLabel}</Badge>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight mb-4 uppercase leading-tight text-[var(--foreground)]">
                {bill.title}
              </h1>
              <div className="flex flex-wrap gap-6 text-sm text-[var(--muted-foreground)] font-mono">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[var(--amber-start)]" />
                  Pateikta:{" "}
                  <span className="text-[var(--foreground)]">
                    {formatDate(bill.submittedAt)}
                  </span>
                </div>
                {bill.votedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[var(--amber-end)]" />
                    Balsuota:{" "}
                    <span className="text-[var(--foreground)]">
                      {formatDate(bill.votedAt)}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[var(--amber-start)]" />
                  ID:{" "}
                  <span className="text-[var(--foreground)]">
                    {bill.seimasId}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <FollowBillButton
                billId={bill.id}
                billTitle={bill.title}
                className="border-[var(--amber-start)]/30 hover:bg-[var(--amber-start)]/10 hover:border-[var(--amber-start)]/50"
              />
              <Button
                variant="outline"
                size="sm"
                className="border-[var(--amber-start)]/30 hover:bg-[var(--amber-start)] hover:text-white"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Dalintis
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-[var(--amber-start)]/30 hover:bg-[var(--amber-start)] hover:text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Atsisiųsti
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Timeline: proposal → committee → vote → result */}
            <div className="border border-muted rounded-lg p-4">
              <div className="p-6 bg-[var(--card)]/80">
                <h3 className="text-lg font-bold uppercase tracking-widest text-[var(--muted-foreground)] mb-6 flex items-center gap-2">
                  <Scale className="h-5 w-5 text-[var(--amber-start)]" />
                  Projekto eiga
                </h3>
                <BillTimeline
                  submittedAt={bill.submittedAt}
                  votedAt={bill.votedAt}
                  createdAt={bill.createdAt}
                  status={bill.status}
                  formatDate={formatDate}
                />
              </div>
            </div>

            {/* AI Summary */}
            <div className="border border-muted rounded-lg p-4">
              <div className="amber-glass p-6 rounded-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Sparkles className="w-24 h-24 text-[var(--amber-start)]" />
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-[var(--amber-start)] flex items-center justify-center text-[var(--peat-oak)]">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold uppercase tracking-widest text-[var(--amber-end)] text-sm">
                      AI Santrauka
                    </h3>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Automatiškai sugeneruota
                    </p>
                  </div>
                </div>

                <ul className="space-y-3 font-serif text-lg leading-relaxed text-[var(--foreground)]">
                  <li className="flex gap-3">
                    <span className="text-[var(--amber-start)] mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--amber-start)] flex-shrink-0" />
                    <span>
                      Įstatymo projektas skirtas{" "}
                      <span className="font-bold text-[var(--copper-moss)]">
                        {bill.category?.toLowerCase()}
                      </span>{" "}
                      srities klausimams spręsti.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--amber-start)] mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--amber-start)] flex-shrink-0" />
                    <span>
                      Numatoma įgyvendinti konkrečias priemones ir pakeitimus
                      esamoje teisinėje bazėje.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--amber-start)] mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--amber-start)] flex-shrink-0" />
                    <span>
                      Siekia užtikrinti skaidrumą ir efektyvumą viešajame
                      sektoriuje.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Description */}
            <div className="p-8 bg-[var(--card)]/50 border border-[var(--amber-start)]/20 rounded-lg">
              <h3 className="text-xl font-bold font-serif mb-6 flex items-center gap-2">
                <ScrollText className="h-5 w-5 text-[var(--amber-start)]" />
                Projekto Aprašymas
              </h3>
              <div className="prose prose-stone dark:prose-invert max-w-none font-serif leading-loose">
                <p>{bill.description || "Aprašymas nepateiktas"}</p>

                {bill.explanatoryNotes && (
                  <>
                    <Separator className="my-8 bg-[var(--amber-start)]/20" />
                    <h4 className="text-lg font-bold mb-4 uppercase tracking-widest text-[var(--muted-foreground)]">
                      Aiškinamasis raštas
                    </h4>
                    <p className="text-[var(--muted-foreground)] italic">
                      {bill.explanatoryNotes}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Voting Records */}
            <div className="border border-muted rounded-lg p-4">
              <div className="p-8 bg-[var(--card)]/80">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold font-serif flex items-center gap-2">
                      <Users className="h-5 w-5 text-[var(--amber-start)]" />
                      Balsavimo Rezultatai
                    </h3>
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">
                      {totalVotes} Seimo narių balsavimo duomenys
                    </p>
                  </div>
                </div>

                {votesLoading ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-8 bg-[var(--muted)]/20 rounded w-full" />
                    <div className="h-32 bg-[var(--muted)]/20 rounded w-full" />
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Vote Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(voteConfig).map(([key, config]) => {
                        const Icon = config.icon;
                        const count = voteStats[key as keyof typeof voteStats];
                        const percentage =
                          totalVotes > 0
                            ? ((count / totalVotes) * 100).toFixed(1)
                            : "0";

                        return (
                          <div
                            key={key}
                            className="text-center p-4 rounded-lg bg-[var(--background)]/50 border border-[var(--amber-start)]/10"
                          >
                            <Icon
                              className={`h-8 w-8 mx-auto mb-2 ${config.color}`}
                            />
                            <div className="text-2xl font-bold font-serif">
                              {count}
                            </div>
                            <div className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
                              {config.label}
                            </div>
                            <div className="text-[10px] text-[var(--amber-end)] font-bold mt-1">
                              {percentage}%
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Vote Progress Bars */}
                    <div className="space-y-4 bg-[var(--background)]/30 p-6 rounded-lg border border-[var(--amber-start)]/10">
                      <div>
                        <div className="flex justify-between text-xs uppercase font-bold mb-2">
                          <span className="text-[var(--copper-moss)]">Už</span>
                          <span>{voteStats.for}</span>
                        </div>
                        <Progress
                          value={
                            activeVotes > 0
                              ? (voteStats.for / activeVotes) * 100
                              : 0
                          }
                          className="h-2 bg-[var(--muted)]"
                          indicatorClassName="bg-[var(--copper-moss)]"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs uppercase font-bold mb-2">
                          <span className="text-[var(--destructive)]">
                            Prieš
                          </span>
                          <span>{voteStats.against}</span>
                        </div>
                        <Progress
                          value={
                            activeVotes > 0
                              ? (voteStats.against / activeVotes) * 100
                              : 0
                          }
                          className="h-2 bg-[var(--muted)]"
                          indicatorClassName="bg-[var(--destructive)]"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs uppercase font-bold mb-2">
                          <span className="text-[var(--amber-end)]">
                            Susilaikė
                          </span>
                          <span>{voteStats.abstain}</span>
                        </div>
                        <Progress
                          value={
                            activeVotes > 0
                              ? (voteStats.abstain / activeVotes) * 100
                              : 0
                          }
                          className="h-2 bg-[var(--muted)]"
                          indicatorClassName="bg-[var(--amber-end)]"
                        />
                      </div>
                    </div>

                    <Separator className="bg-[var(--amber-start)]/20" />

                    {/* Individual Votes */}
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <h3 className="font-bold text-sm uppercase tracking-widest text-[var(--muted-foreground)]">
                          Individualūs balsai
                        </h3>
                        <div className="flex flex-wrap items-center gap-3">
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={showOnlyBreaking}
                              onChange={e =>
                                setShowOnlyBreaking(e.target.checked)
                              }
                              className="rounded border-[var(--amber-start)]/50 bg-transparent text-[var(--amber-start)] focus:ring-[var(--amber-start)]"
                            />
                            <span className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)] group-hover:text-[var(--amber-end)] transition-colors flex items-center gap-1.5">
                              <AlertTriangle className="h-3.5 w-3.5 text-[var(--amber-end)]" />
                              Tik prieš frakciją
                            </span>
                          </label>
                          <select
                            value={selectedParty}
                            onChange={e => setSelectedParty(e.target.value)}
                            aria-label="Filtruoti pagal frakciją"
                            className="text-xs font-bold uppercase border-b border-[var(--amber-start)] bg-transparent py-1 cursor-pointer outline-none focus:border-[var(--amber-end)] hover:text-[var(--amber-end)] transition-colors"
                          >
                            <option value="all">Visos frakcijos</option>
                            {parties.slice(1).map(party => (
                              <option key={party} value={party}>
                                {party}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        {filteredVotes?.map(({ vote, mp }) => {
                          if (!vote || !mp) return null;

                          const key = normalizeVote(vote.voteValue);
                          const voteConf =
                            voteConfig[key as keyof typeof voteConfig] ??
                            voteConfig.absent;
                          const VoteIcon = voteConf.icon;
                          const breaking = isBreakingWithParty(
                            mp,
                            vote.voteValue,
                            partyMajority
                          );

                          return (
                            <Link key={vote.id} href={`/mp/${mp.id}`}>
                              <div
                                className={`flex items-center justify-between p-3 rounded border transition-all cursor-pointer group ${
                                  breaking
                                    ? "border-[var(--amber-end)]/50 bg-[var(--amber-start)]/5 hover:bg-[var(--amber-start)]/10"
                                    : "border-transparent hover:border-[var(--amber-start)]/30 hover:bg-[var(--background)]/80"
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <Avatar className="h-8 w-8 ring-2 ring-transparent group-hover:ring-[var(--amber-start)]/50 transition-all shrink-0">
                                    <AvatarImage
                                      src={mp.photoUrl || undefined}
                                    />
                                    <AvatarFallback className="text-[10px] bg-[var(--peat-oak)] text-[var(--amber-start)]">
                                      {mp.name
                                        .split(" ")
                                        .map(n => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <div className="text-sm font-bold leading-none group-hover:text-[var(--amber-start)] transition-colors truncate">
                                      {mp.name}
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                      <span className="text-[10px] text-[var(--muted-foreground)]">
                                        {mp.party}
                                      </span>
                                      {breaking && (
                                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase text-[var(--amber-end)]">
                                          <AlertTriangle className="h-3 w-3" />
                                          Prieš frakciją
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <VoteIcon
                                    className={`h-4 w-4 ${voteConf.color}`}
                                  />
                                  <span
                                    className={`text-xs font-bold uppercase ${voteConf.color}`}
                                  >
                                    {voteConf.label}
                                  </span>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="border border-muted rounded-lg p-4">
              <div className="p-6 bg-[var(--card)]/80">
                <h3 className="text-lg font-bold uppercase tracking-widest mb-6 border-b border-[var(--amber-start)]/20 pb-2">
                  Statistika
                </h3>
                <div className="space-y-6">
                  <div>
                    <div className="text-xs text-[var(--muted-foreground)] mb-1 uppercase tracking-wider">
                      Balsavimo aktyvumas
                    </div>
                    <div className="text-3xl font-bold font-serif text-[var(--foreground)]">
                      {totalVotes > 0
                        ? ((activeVotes / totalVotes) * 100).toFixed(1)
                        : 0}
                      %
                    </div>
                    <Progress
                      value={
                        totalVotes > 0 ? (activeVotes / totalVotes) * 100 : 0
                      }
                      className="mt-2 h-1.5 bg-[var(--muted)]"
                      indicatorClassName="bg-[var(--foreground)]"
                    />
                  </div>
                  <div>
                    <div className="text-xs text-[var(--muted-foreground)] mb-1 uppercase tracking-wider">
                      Palaikymo lygis
                    </div>
                    <div className="text-3xl font-bold font-serif text-[var(--copper-moss)]">
                      {activeVotes > 0
                        ? ((voteStats.for / activeVotes) * 100).toFixed(1)
                        : 0}
                      %
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)] mt-1 italic">
                      {voteStats.for} iš {activeVotes} balsavusių
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Bills */}
            <div className="border border-muted rounded-lg p-4">
              <div className="p-6 bg-[var(--card)]/80 min-h-[200px] flex flex-col justify-center text-center">
                <h3 className="text-lg font-bold uppercase tracking-widest mb-2">
                  Susiję projektai
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] mb-4">
                  Tos pačios kategorijos įstatymai
                </p>

                <div className="p-4 border border-dashed border-[var(--amber-start)]/30 rounded bg-[var(--background)]/50">
                  <p className="text-sm text-[var(--amber-end)] italic font-serif">
                    Susiję projektai bus rodomi netrukus
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
