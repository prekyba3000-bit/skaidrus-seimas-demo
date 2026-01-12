import { useRoute, useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Users,
  Activity,
  FileText,
  Globe,
  TrendingUp,
  Target,
  Shield,
  Zap,
  ChevronRight,
  Info,
  Plus,
  ArrowLeftRight,
  CheckCircle2,
  Download,
  XCircle,
  MinusCircle,
  HelpCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { getPartyColors } from "@/lib/constants";
import { FollowButton } from "@/components/FollowButton";
import { Skeleton, SkeletonHeader, SkeletonAvatar, SkeletonText, SkeletonCard } from "@/components/ui/skeleton";

// Vote status configuration
const getVoteConfig = (voteValue: string) => {
  const normalized = voteValue?.toLowerCase() || "";
  
  if (normalized === "for" || normalized === "už") {
    return {
      icon: CheckCircle2,
      color: "text-emerald-400",
      borderColor: "border-primary",
      bgColor: "bg-primary",
      label: "UŽ"
    };
  }
  if (normalized === "against" || normalized === "prieš") {
    return {
      icon: XCircle,
      color: "text-rose-400",
      borderColor: "border-rose-500",
      bgColor: "bg-rose-500",
      label: "PRIEŠ"
    };
  }
  if (normalized === "abstain" || normalized === "susilaikė") {
    return {
      icon: MinusCircle,
      color: "text-amber-400",
      borderColor: "border-amber-500",
      bgColor: "bg-amber-500",
      label: "SUSILAIKĖ"
    };
  }
  // Default: absent/not voted
  return {
    icon: HelpCircle,
    color: "text-slate-500",
    borderColor: "border-slate-600",
    bgColor: "bg-slate-600",
    label: "NEDALYVAVO"
  };
};

export default function MPProfile() {
  const [, params] = useRoute("/mp/:id");
  const [, navigate] = useLocation();
  const mpId = params?.id ? parseInt(params.id, 10) : null;

  const { data: mpData, isLoading: mpLoading } = trpc.mps.byId.useQuery(
    { id: mpId! },
    { enabled: !!mpId }
  );

  const { data: stats } = trpc.mps.stats.useQuery(
    { mpId: mpId! },
    { enabled: !!mpId }
  );

  const { data: votesDataResponse } = trpc.votes.byMp.useQuery(
    { mpId: mpId!, limit: 20 },
    { enabled: !!mpId }
  );
  
  // Handle both array and object responses from the API
  const votesData = Array.isArray(votesDataResponse) 
    ? votesDataResponse 
    : votesDataResponse?.items || [];

  if (mpLoading) {
    return (
      <DashboardLayout title="Seimo Nario Profilis">
        <div className="space-y-6 px-4 md:px-0">
          {/* Header Skeleton */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Hero Section Skeleton */}
          <div className="bg-surface-dark border-surface-border rounded-lg p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <SkeletonAvatar size={120} />
              <div className="flex-1 space-y-4">
                <SkeletonHeader />
                <SkeletonText lines={3} />
              </div>
            </div>
          </div>

          {/* Tabs Skeleton */}
          <div className="space-y-4">
            <div className="flex gap-2 border-b border-surface-border">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-24" />
              ))}
            </div>
            <SkeletonCard className="h-64" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!mpData) {
    return (
      <DashboardLayout title="Seimo Nario Profilis">
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Narys nerastas</h2>
            <p className="text-[#92adc9] mb-6">Nurodytas Seimo narys neegzistuoja arba buvo pašalintas</p>
            <Button onClick={() => navigate("/")} variant="default">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Grįžti į sąrašą
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { assistants, trips, ...mp } = mpData;
  const partyColors = getPartyColors(mp.party);

  return (
    <DashboardLayout title={`Profilis: ${mp.name}`}>
      {/* Top Banner / Back Action */}
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="text-[#92adc9] hover:text-white flex items-center gap-2 p-0 h-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-bold uppercase tracking-wider">Atgal į sąrašą</span>
        </Button>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(`/compare?ids=${mp.id}`)}
            className="text-[#92adc9] hover:text-white border-surface-border hover:border-primary"
          >
            <ArrowLeftRight className="w-4 h-4 mr-2" />
            <span className="text-sm font-bold uppercase tracking-wider">Palyginti</span>
          </Button>
          <div className="bg-[#233648] border border-surface-border rounded-lg px-3 py-1.5 flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            <span className="text-[#92adc9] text-xs font-medium uppercase tracking-widest">ID: {mp.seimasId}</span>
          </div>
        </div>
      </div>

      {/* Noble Glass Header with Dieva zīme Protection */}
      <div className="relative glass-panel rounded-2xl overflow-hidden p-8 md:p-10 group mb-6">
        {/* Dieva zīme Symbol (Protective Roof) Background */}
        <div className="absolute inset-0 pointer-events-none opacity-20 group-hover:opacity-25 transition-opacity duration-700">
          <svg className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] text-primary" preserveAspectRatio="none" viewBox="0 0 100 100">
            {/* Triangle Roof Shape */}
            <path d="M50 10 L10 60 H90 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <path d="M50 15 L15 58 H85 Z" fill="none" stroke="currentColor" strokeWidth="0.2" />
            {/* Decorative circle at top */}
            <circle className="animate-pulse" cx="50" cy="10" fill="currentColor" r="2" />
          </svg>
          {/* Deep Etch Texture - using CSS pattern instead of external URL */}
          <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,.03) 2px, rgba(255,255,255,.03) 4px)',
            backgroundSize: '20px 20px'
          }} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
          {/* Amber-Glow Portrait */}
          <div className="relative shrink-0">
            <div className="size-32 rounded-2xl overflow-hidden border border-primary/40 shadow-[0_0_20px_rgba(245,159,10,0.25)] relative">
              {/* Inner shadow for depth */}
              <div className="absolute inset-0 z-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] rounded-2xl pointer-events-none" />
              <Avatar className="w-full h-full rounded-2xl">
                <AvatarImage src={mp.photoUrl || ""} className="object-cover" />
                <AvatarFallback className="bg-emerald-900/50 text-primary text-2xl font-bold">{mp.name[0]}</AvatarFallback>
              </Avatar>
            </div>
            {/* MP Badge */}
            <div className="absolute -bottom-3 -right-3 bg-[#0d261f] border border-primary text-primary text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>MP</span>
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-emerald-900/50 border border-emerald-700/50 text-emerald-300 text-xs font-medium uppercase tracking-wider">
                Apygarda: {mp.district || "Daugiamandatė"}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">{mp.name}</h1>
            <p className="text-gray-400 text-lg mb-4 max-w-2xl">
              Seimo narys <span className="text-primary mx-2">•</span> {mp.party || "Nepartinis"}
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start w-full">
              <Button 
                className="flex items-center gap-2 bg-primary hover:bg-amber-400 text-[#021C15] font-bold py-2.5 px-5 rounded-xl transition-all shadow-[0_0_15px_rgba(245,159,10,0.4)] hover:shadow-[0_0_25px_rgba(245,159,10,0.6)]"
                onClick={() => window.location.href = `mailto:${mp.email || ''}`}
              >
                <Mail className="w-5 h-5" />
                Susisiekti
              </Button>
              <Button 
                variant="outline"
                className="flex items-center gap-2 bg-[#0d261f] hover:bg-[#15382e] border border-[#1f3a33] text-emerald-100 font-medium py-2.5 px-5 rounded-xl transition-all"
                onClick={() => {/* TODO: Download CV functionality */}}
              >
                <Download className="w-5 h-5" />
                Atsisiųsti CV
              </Button>
            </div>
          </div>

          {/* Quick Stats (Mini Grid) - Replaced "Term" with Accountability Score */}
          <div className="flex gap-4 md:gap-8 border-t md:border-t-0 md:border-l border-[#1f3a33] pt-6 md:pt-0 md:pl-8 mt-2 md:mt-0 justify-center md:justify-start w-full md:w-auto">
            <div className="text-center md:text-left">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Lankomumas</p>
              <p className="text-2xl font-bold text-primary">
                {stats?.votingAttendance ? parseFloat(stats.votingAttendance).toFixed(0) : 0}%
              </p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Projektai</p>
              <p className="text-2xl font-bold text-primary">{stats?.billsProposed || 0}</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Atskaitomybė</p>
              <p className="text-2xl font-bold text-white">
                {stats?.accountabilityScore ? parseFloat(stats.accountabilityScore).toFixed(0) : 0}<span className="text-sm font-normal text-gray-500 ml-1">%</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Left (Votes Timeline) | Right (Overview Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        {/* Left Column: Zalktis Timeline (Votes) - 8 columns */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-panel rounded-2xl p-6 min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Balsavimų Istorija
              </h2>
            </div>
            
            <div className="relative flex-1 pl-4 md:pl-12 pr-2">
              {/* Mobile Fallback Timeline Thread */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-amber-500/20 md:hidden z-0" />
              
              {/* Zalktis Timeline SVG Background (Desktop only) */}
              <svg 
                className="hidden md:block absolute top-0 left-[26px] h-[95%] w-10 pointer-events-none z-0" 
                preserveAspectRatio="none"
                viewBox="0 0 10 100"
              >
                <defs>
                  <linearGradient id="amberGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "#f59f0a", stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: "#f59f0a", stopOpacity: 0.1 }} />
                  </linearGradient>
                </defs>
                {/* A wavy S-curve line (Zalktis) */}
                <path 
                  className="zalktis-path"
                  d="M 2 10 Q 15 40, 2 70 T 2 130 T 2 190 T 2 250 T 2 310" 
                  fill="none" 
                  stroke="url(#amberGradient)" 
                  strokeLinecap="round" 
                  strokeWidth="2"
                />
              </svg>
              
              {/* Timeline Items */}
              <div className="space-y-12 relative z-10">
                {votesData && votesData.length > 0 ? (
                  votesData.map((item, idx) => {
                    const voteConfig = getVoteConfig(item.vote.voteValue);
                    const VoteIcon = voteConfig.icon;
                    const isFirst = idx === 0;
                    const votedAt = item.vote.votedAt ? new Date(item.vote.votedAt) : null;
                    const relativeTime = votedAt ? formatDistanceToNow(votedAt, { addSuffix: true }) : null;
                    
                    return (
                      <div key={idx} className="relative pl-8 md:pl-12 group">
                        {/* Timeline Node */}
                        <div className={`absolute left-0 md:left-0 top-1 size-7 bg-[#0d261f] rounded-full flex items-center justify-center z-20 transition-all ${
                          isFirst 
                            ? `border-2 ${voteConfig.borderColor} shadow-[0_0_10px_rgba(245,159,10,0.5)]` 
                            : `border border-slate-600 group-hover:border-2`
                        } ${
                          !isFirst && voteConfig.borderColor === "border-primary" ? "group-hover:border-primary" :
                          !isFirst && voteConfig.borderColor === "border-rose-500" ? "group-hover:border-rose-500" :
                          !isFirst && voteConfig.borderColor === "border-amber-500" ? "group-hover:border-amber-500" :
                          !isFirst ? "group-hover:border-slate-600" : ""
                        }`}>
                          {isFirst ? (
                            <div className={`size-2 rounded-full ${voteConfig.bgColor === "bg-primary" ? "bg-primary" : voteConfig.bgColor === "bg-rose-500" ? "bg-rose-500" : voteConfig.bgColor === "bg-amber-500" ? "bg-amber-500" : "bg-slate-600"}`} />
                          ) : (
                            <VoteIcon className={`w-3.5 h-3.5 ${voteConfig.color} group-hover:scale-110 transition-transform`} />
                          )}
                        </div>
                        
                        {/* Vote Card */}
                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-semibold text-lg group-hover:text-primary transition-colors cursor-pointer leading-tight">
                              {item.bill?.title || "Balsavimas dėl teisės akto"}
                            </h4>
                            <p className="text-gray-400 text-sm mt-1">
                              {voteConfig.label}
                            </p>
                          </div>
                          {relativeTime && (
                            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20 whitespace-nowrap shrink-0">
                              {relativeTime}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-20 text-center text-[#92adc9] font-medium">
                    Balsavimų duomenų nerasta.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Overview Sidebar - 4 columns */}
        <div className="lg:col-span-4 space-y-6">
          {/* Expanded Stats Cards */}
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-xl flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-white text-base font-semibold">Teisėkūra</h3>
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex items-end justify-between">
                <div className="flex flex-col">
                  <span className="text-4xl font-black text-white">{stats?.billsProposed || 0}</span>
                  <span className="text-gray-400 text-xs uppercase font-bold tracking-widest mt-1">Pateikta projektų</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 text-sm font-bold flex items-center justify-end">
                    <Plus className="w-4 h-4" /> {stats?.billsPassed || 0}
                  </span>
                  <span className="text-gray-400 text-xs uppercase font-bold tracking-widest">Priimta</span>
                </div>
              </div>
              <Progress value={((stats?.billsPassed || 0) / (stats?.billsProposed || 1)) * 100} className="h-1.5 bg-[#233648]" indicatorClassName="bg-emerald-400" />
            </div>

            <div className="glass-panel p-6 rounded-xl flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-white text-base font-semibold">Lankomumas</h3>
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div className="flex items-end justify-between">
                <div className="flex flex-col">
                  <span className="text-4xl font-black text-white">{stats?.votingAttendance ? parseFloat(stats.votingAttendance).toFixed(1) : 0}%</span>
                  <span className="text-gray-400 text-xs uppercase font-bold tracking-widest mt-1">Balsavimo aktyvumas</span>
                </div>
                <div className="text-right">
                  <TrendingUp className="w-5 h-5 text-emerald-400 ml-auto" />
                  <span className="text-gray-400 text-xs uppercase font-bold tracking-widest">Stabili tendencija</span>
                </div>
              </div>
              <Progress value={stats?.votingAttendance ? parseFloat(stats.votingAttendance) : 0} className="h-1.5 bg-[#233648]" indicatorClassName="bg-primary" />
            </div>

            <div className="glass-panel rounded-xl p-6 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h4 className="text-white text-base font-semibold">Frakcijos Lojalumas</h4>
                <div className="relative w-16 h-16 shrink-0 bg-transparent">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path className="text-[#233648]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                    <path className="text-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${stats?.partyLoyalty ? parseFloat(stats.partyLoyalty) : 0}, 100`} strokeLinecap="round" strokeWidth="3" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-white text-lg font-black">{stats?.partyLoyalty ? parseFloat(stats.partyLoyalty).toFixed(0) : 0}%</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Lojalumo balas skaičiuojamas pagal tai, kaip narys balsuoja lyginant su frakcijos dauguma. 
                Šiuo metu {mp.name} balsavimai sutampa su partijos linija <span className="text-white font-bold">{stats?.partyLoyalty ? parseFloat(stats.partyLoyalty).toFixed(1) : 0}%</span> atvejų.
              </p>
            </div>
          </div>

          {/* Biography Section */}
          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-white text-base font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Biografija
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed line-clamp-6">
              {mp.biography || "Biografija šiuo metu nepasiekiama. Duomenys sinchronizuojami iš Seimo API."}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
