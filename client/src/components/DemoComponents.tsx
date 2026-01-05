import { cn } from "@/lib/utils";
import {
  Check,
  Info,
  ThumbsDown,
  ThumbsUp,
  Minus,
  X,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Extend Progress props to include indicatorClassName locally since we can't modify the ui component easily in this context
declare module "@/components/ui/progress" {
  export interface ProgressProps {
    indicatorClassName?: string;
  }
}
import { Badge } from "@/components/ui/badge";

// --- Statistics Card ---

interface StatisticsCardProps {
  title: string;
  value: number;
  unit?: string;
  description: string;
  tooltip: string;
  showProgress?: boolean;
  trend?: "up" | "down" | "neutral";
}

export function StatisticsCard({
  title,
  value,
  unit = "",
  description,
  tooltip,
  showProgress = false,
  trend,
}: StatisticsCardProps) {
  // Determine color scheme based on value
  let colorClass = "text-primary";
  let bgClass = "bg-primary/10";
  let borderClass = "border-primary/20";

  if (value >= 90) {
    colorClass = "text-green-600";
    bgClass = "bg-green-50";
    borderClass = "border-green-200";
  } else if (value >= 75) {
    colorClass = "text-blue-600";
    bgClass = "bg-blue-50";
    borderClass = "border-blue-200";
  } else if (value >= 50) {
    colorClass = "text-yellow-600";
    bgClass = "bg-yellow-50";
    borderClass = "border-yellow-200";
  } else {
    colorClass = "text-red-600";
    bgClass = "bg-red-50";
    borderClass = "border-red-200";
  }

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all hover:shadow-md",
        borderClass
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground/50 hover:text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs text-xs">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-2">
          <div className={cn("text-3xl font-bold", colorClass)}>
            {value}
            {unit}
          </div>
          {trend && (
            <div
              className={cn(
                "flex items-center text-xs font-medium",
                trend === "up"
                  ? "text-green-600"
                  : trend === "down"
                    ? "text-red-600"
                    : "text-muted-foreground"
              )}
            >
              {trend === "up" ? (
                <TrendingUp className="mr-1 h-3 w-3" />
              ) : trend === "down" ? (
                <TrendingDown className="mr-1 h-3 w-3" />
              ) : (
                <Minus className="mr-1 h-3 w-3" />
              )}
              {trend === "up" ? "+2.5%" : trend === "down" ? "-1.2%" : "0%"}
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {showProgress && (
          <div className="mt-4">
            <Progress
              value={value}
              className="h-2"
              indicatorClassName={
                value >= 90
                  ? "bg-green-600"
                  : value >= 75
                    ? "bg-blue-600"
                    : value >= 50
                      ? "bg-yellow-600"
                      : "bg-red-600"
              }
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// --- Accountability Score ---

interface AccountabilityScoreProps {
  score: number;
  votingAttendance: number;
  partyLoyalty: number;
  accountabilityFlags?: number;
}

export function AccountabilityScore({
  score,
  votingAttendance,
  partyLoyalty,
  accountabilityFlags = 0,
}: AccountabilityScoreProps) {
  // Determine grade and color
  let grade = "F";
  let color = "text-red-600";
  let ringColor = "stroke-red-600";
  let bgColor = "bg-red-50";

  if (score >= 95) {
    grade = "A+";
    color = "text-green-600";
    ringColor = "stroke-green-600";
    bgColor = "bg-green-50";
  } else if (score >= 90) {
    grade = "A";
    color = "text-green-500";
    ringColor = "stroke-green-500";
    bgColor = "bg-green-50";
  } else if (score >= 80) {
    grade = "B";
    color = "text-blue-600";
    ringColor = "stroke-blue-600";
    bgColor = "bg-blue-50";
  } else if (score >= 70) {
    grade = "C";
    color = "text-yellow-600";
    ringColor = "stroke-yellow-600";
    bgColor = "bg-yellow-50";
  } else if (score >= 60) {
    grade = "D";
    color = "text-orange-600";
    ringColor = "stroke-orange-600";
    bgColor = "bg-orange-50";
  }

  // Calculate circle properties
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card className="h-full overflow-hidden border-l-4 border-l-primary">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Atskaitomybės Balas</span>
          {accountabilityFlags > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge
                    variant="destructive"
                    className="flex items-center gap-1"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    {accountabilityFlags} Įspėjimai
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Aptikti balsavimo neatitikimai</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardTitle>
        <CardDescription>Bendras veiklos įvertinimas</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-6">
        <div className="relative flex items-center justify-center mb-6">
          {/* Background Circle */}
          <svg className="transform -rotate-90 w-48 h-48">
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-muted/20"
            />
            {/* Progress Circle */}
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={cn("transition-all duration-1000 ease-out", ringColor)}
            />
          </svg>

          {/* Center Text */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className={cn("text-5xl font-bold", color)}>{grade}</span>
            <span className="text-sm text-muted-foreground font-medium">
              {score}/100
            </span>
          </div>
        </div>

        <div className="w-full grid grid-cols-2 gap-4 text-sm">
          <div className="flex flex-col p-3 bg-muted/50 rounded-lg">
            <span className="text-muted-foreground mb-1">Lankomumas (60%)</span>
            <span className="font-semibold">{votingAttendance}%</span>
          </div>
          <div className="flex flex-col p-3 bg-muted/50 rounded-lg">
            <span className="text-muted-foreground mb-1">Lojalumas (40%)</span>
            <span className="font-semibold">{partyLoyalty}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Voting Breakdown Chart ---

interface VotingBreakdownChartProps {
  votesFor: number;
  votesAgainst: number;
  abstentions: number;
  absences: number;
  totalVotes: number;
}

export function VotingBreakdownChart({
  votesFor,
  votesAgainst,
  abstentions,
  absences,
  totalVotes,
}: VotingBreakdownChartProps) {
  // Calculate percentages
  const pFor = totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0;
  const pAgainst = totalVotes > 0 ? (votesAgainst / totalVotes) * 100 : 0;
  const pAbstain = totalVotes > 0 ? (abstentions / totalVotes) * 100 : 0;
  const pAbsent = totalVotes > 0 ? (absences / totalVotes) * 100 : 0;

  // Calculate active participation (excluding absences)
  const activeParticipation =
    totalVotes > 0 ? ((totalVotes - absences) / totalVotes) * 100 : 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Balsavimo Išklotinė</CardTitle>
        <CardDescription>
          Visų registruotų balsavimų pasiskirstymas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Stacked Bar Chart */}
        <div className="h-8 w-full flex rounded-full overflow-hidden mb-6 ring-1 ring-border">
          {pFor > 0 && (
            <div
              style={{ width: `${pFor}%` }}
              className="bg-green-500 hover:bg-green-600 transition-colors flex items-center justify-center"
              title={`Už: ${votesFor} (${pFor.toFixed(1)}%)`}
            />
          )}
          {pAgainst > 0 && (
            <div
              style={{ width: `${pAgainst}%` }}
              className="bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center"
              title={`Prieš: ${votesAgainst} (${pAgainst.toFixed(1)}%)`}
            />
          )}
          {pAbstain > 0 && (
            <div
              style={{ width: `${pAbstain}%` }}
              className="bg-yellow-400 hover:bg-yellow-500 transition-colors flex items-center justify-center"
              title={`Susilaikė: ${abstentions} (${pAbstain.toFixed(1)}%)`}
            />
          )}
          {pAbsent > 0 && (
            <div
              style={{ width: `${pAbsent}%` }}
              className="bg-slate-200 hover:bg-slate-300 transition-colors flex items-center justify-center"
              title={`Nedalyvavo: ${absences} (${pAbsent.toFixed(1)}%)`}
            />
          )}
        </div>

        {/* Legend Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="p-2 bg-green-100 text-green-700 rounded-full">
              <ThumbsUp className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Už</p>
              <p className="text-xs text-muted-foreground">
                {votesFor} balsai ({pFor.toFixed(1)}%)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="p-2 bg-red-100 text-red-700 rounded-full">
              <ThumbsDown className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Prieš</p>
              <p className="text-xs text-muted-foreground">
                {votesAgainst} balsai ({pAgainst.toFixed(1)}%)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="p-2 bg-yellow-100 text-yellow-700 rounded-full">
              <Minus className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Susilaikė</p>
              <p className="text-xs text-muted-foreground">
                {abstentions} balsai ({pAbstain.toFixed(1)}%)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="p-2 bg-slate-100 text-slate-700 rounded-full">
              <X className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Nedalyvavo</p>
              <p className="text-xs text-muted-foreground">
                {absences} balsai ({pAbsent.toFixed(1)}%)
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Viso balsavimų:</span>
          <span className="font-bold">{totalVotes}</span>
        </div>
        <div className="mt-1 flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Aktyvus dalyvavimas:</span>
          <span
            className={cn(
              "font-bold",
              activeParticipation < 80 ? "text-red-600" : "text-green-600"
            )}
          >
            {activeParticipation.toFixed(1)}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Legislative Activity ---

interface LegislativeActivityProps {
  billsProposed: number;
  billsPassed: number;
}

export function LegislativeActivity({
  billsProposed,
  billsPassed,
}: LegislativeActivityProps) {
  const successRate =
    billsProposed > 0 ? (billsPassed / billsProposed) * 100 : 0;
  const pending = billsProposed - billsPassed; // Simplified for demo

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Teisėkūros Aktyvumas</CardTitle>
        <CardDescription>
          Pasiūlytų ir priimtų teisės aktų statistika
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium">Sėkmės rodiklis</span>
            <span className="text-2xl font-bold text-primary">
              {successRate.toFixed(1)}%
            </span>
          </div>
          <Progress value={successRate} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">
            Procentas pasiūlytų projektų, kurie tapo įstatymais
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/30 p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold mb-1">{billsProposed}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Pasiūlyta
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-center">
            <div className="text-2xl font-bold text-green-700 mb-1">
              {billsPassed}
            </div>
            <div className="text-xs text-green-600 uppercase tracking-wider">
              Priimta
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-center">
            <div className="text-2xl font-bold text-red-700 mb-1">0</div>
            <div className="text-xs text-red-600 uppercase tracking-wider">
              Atmesta
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
            <div className="text-2xl font-bold text-blue-700 mb-1">
              {pending}
            </div>
            <div className="text-xs text-blue-600 uppercase tracking-wider">
              Svarstoma
            </div>
          </div>
        </div>

        <div className="mt-6 p-3 bg-muted/50 rounded text-sm italic text-muted-foreground border-l-2 border-primary">
          "Seimo narys pasižymi aukštu teisėkūros efektyvumu, viršijančiu
          vidurkį."
        </div>
      </CardContent>
    </Card>
  );
}
