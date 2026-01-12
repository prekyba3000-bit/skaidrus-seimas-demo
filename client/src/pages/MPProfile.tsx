import { useState, useMemo } from "react";
import { useRoute, useLocation } from "wouter";
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
  ArrowLeftRight
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

export default function MPProfile() {
  const [, params] = useRoute("/mp/:id");
  const [, navigate] = useLocation();
  const mpId = params?.id ? parseInt(params.id, 10) : null;
  const [activeTab, setActiveTab] = useState("overview");

  const { data: mpData, isLoading: mpLoading } = trpc.mps.byId.useQuery(
    { id: mpId! },
    { enabled: !!mpId }
  );

  const { data: stats } = trpc.mps.stats.useQuery(
    { mpId: mpId! },
    { enabled: !!mpId }
  );

  const { data: votesData } = trpc.votes.byMp.useQuery(
    { mpId: mpId!, limit: 20 },
    { enabled: !!mpId }
  );

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

  const tabs = [
    { id: "overview", label: "Apžvalga", icon: Activity },
    { id: "assistants", label: "Komanda", icon: Users },
    { id: "votes", label: "Balsavimai", icon: FileText },
    { id: "trips", label: "Komandiruotės", icon: Globe },
  ];

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Profile Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-dark border border-surface-border rounded-xl overflow-hidden shadow-lg">
            <div className="relative h-32 bg-gradient-to-br from-primary to-blue-700">
              <div className="absolute top-4 right-4 group">
                <Button size="icon" variant="ghost" className="bg-white/10 hover:bg-white/20 text-white border-none rounded-full">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="px-6 pb-8 relative">
              <Avatar className="h-32 w-32 border-8 border-surface-dark rounded-xl absolute -top-16 shadow-2xl">
                <AvatarImage src={mp.photoUrl || ""} className="object-cover" />
                <AvatarFallback>{mp.name[0]}</AvatarFallback>
              </Avatar>

              {/* Follow Button - positioned near avatar */}
              <div className="absolute top-4 right-6">
                <FollowButton mpId={mp.id} />
              </div>

              <div className="pt-20">
                <h1 className="text-3xl font-black text-white leading-tight">{mp.name}</h1>
                {mp.party && (
                  <Badge 
                    className={`${partyColors.bg} ${partyColors.text} ${partyColors.border} border mt-2 px-3 py-1 font-bold uppercase tracking-[0.1em] text-xs`}
                  >
                    {mp.party}
                  </Badge>
                )}
                
                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-4 text-sm group">
                    <div className="w-9 h-9 rounded-lg bg-[#233648] flex items-center justify-center text-primary shrink-0 transition-colors group-hover:bg-primary group-hover:text-white">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#92adc9] text-[10px] uppercase font-bold tracking-widest">Apygarda</span>
                      <span className="text-white font-medium">{mp.district || "Daugiamandatė"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm group">
                    <div className="w-9 h-9 rounded-lg bg-[#233648] flex items-center justify-center text-primary shrink-0 transition-colors group-hover:bg-primary group-hover:text-white">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#92adc9] text-[10px] uppercase font-bold tracking-widest">El. Paštas</span>
                      <span className="text-white font-medium truncate max-w-[200px]">{mp.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm group">
                    <div className="w-9 h-9 rounded-lg bg-[#233648] flex items-center justify-center text-primary shrink-0 transition-colors group-hover:bg-primary group-hover:text-white">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#92adc9] text-[10px] uppercase font-bold tracking-widest">Mandatas</span>
                      <span className="text-accent-green font-bold">AKTYVUS</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-surface-border">
                  <p className="text-[#92adc9] text-sm leading-relaxed italic line-clamp-4">
                    {mp.biography || "Biografija šiuo metu nepasiekiama."}
                  </p>
                  <Button variant="link" className="text-primary p-0 h-auto mt-2 text-xs font-bold uppercase tracking-wider" onClick={() => setActiveTab("biography")}>
                    Skaityti daugiau
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#18232e] border border-surface-border rounded-xl p-6 flex items-center justify-between group cursor-pointer hover:border-primary/50 transition-all">
             <div className="flex flex-col gap-1">
               <span className="text-[#92adc9] text-[10px] uppercase font-bold tracking-widest">Atskaitomybė</span>
               <span className="text-white text-2xl font-black">{stats?.accountabilityScore ? parseFloat(stats.accountabilityScore).toFixed(0) : 0}%</span>
             </div>
             <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent rotate-45 flex items-center justify-center text-primary">
                <Target className="w-5 h-5 -rotate-45" />
             </div>
          </div>
        </div>

        {/* Right: Detailed Analysis */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Custom Navigation */}
          <nav className="flex items-center gap-2 border-b border-surface-border overflow-x-auto no-scrollbar pb-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${
                  activeTab === tab.id ? "text-primary" : "text-[#92adc9] hover:text-white"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full shadow-[0_-4px_10px_rgba(19,127,236,0.3)]" />
                )}
              </button>
            ))}
          </nav>

          <div className="flex-1">
            {activeTab === "overview" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-surface-dark border border-surface-border p-6 rounded-xl flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-white text-sm font-bold uppercase tracking-widest">Teisėkūra</h3>
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex items-end justify-between">
                       <div className="flex flex-col">
                         <span className="text-4xl font-black text-white">{stats?.billsProposed || 0}</span>
                         <span className="text-[#92adc9] text-[10px] uppercase font-bold tracking-widest">Pateikta projektų</span>
                       </div>
                       <div className="text-right">
                         <span className="text-accent-green text-sm font-bold flex items-center justify-end">
                            <Plus className="w-4 h-4" /> {stats?.billsPassed || 0}
                         </span>
                         <span className="text-[#92adc9] text-[10px] uppercase font-bold tracking-widest">Priimta</span>
                       </div>
                    </div>
                    <Progress value={((stats?.billsPassed || 0) / (stats?.billsProposed || 1)) * 100} className="h-1.5 bg-[#233648]" indicatorClassName="bg-accent-green" />
                  </div>

                  <div className="bg-surface-dark border border-surface-border p-6 rounded-xl flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-white text-sm font-bold uppercase tracking-widest">Lankomumas</h3>
                      <Activity className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex items-end justify-between">
                       <div className="flex flex-col">
                         <span className="text-4xl font-black text-white">{stats?.votingAttendance ? parseFloat(stats.votingAttendance).toFixed(1) : 0}%</span>
                         <span className="text-[#92adc9] text-[10px] uppercase font-bold tracking-widest">Balsavimo aktyvumas</span>
                       </div>
                       <div className="text-right">
                         <TrendingUp className="w-5 h-5 text-accent-green ml-auto" />
                         <span className="text-[#92adc9] text-[10px] uppercase font-bold tracking-widest">Stabili tendencija</span>
                       </div>
                    </div>
                    <Progress value={stats?.votingAttendance ? parseFloat(stats.votingAttendance) : 0} className="h-1.5 bg-[#233648]" indicatorClassName="bg-primary" />
                  </div>
                </div>

                <div className="bg-surface-dark border border-surface-border rounded-xl p-8 flex items-center gap-8">
                  <div className="relative w-32 h-32 shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path className="text-[#233648]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                      <path className="text-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${stats?.partyLoyalty ? parseFloat(stats.partyLoyalty) : 0}, 100`} strokeLinecap="round" strokeWidth="3" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-white text-xl font-black">{stats?.partyLoyalty ? parseFloat(stats.partyLoyalty).toFixed(0) : 0}%</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h4 className="text-white text-lg font-bold">Frakcijos Lojalumas</h4>
                    <p className="text-[#92adc9] text-sm leading-relaxed">
                      Lojalumo balas skaičiuojamas pagal tai, kaip narys balsuoja lyginant su frakcijos dauguma. 
                      Šiuo metu {mp.name} balsavimai sutampa su partijos linija <span className="text-white font-bold">{stats?.partyLoyalty ? parseFloat(stats.partyLoyalty).toFixed(1) : 0}%</span> atvejų.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "assistants" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-500">
                {assistants && assistants.length > 0 ? (
                  assistants.map((assistant: any) => (
                    <div key={assistant.id} className="bg-surface-dark border border-surface-border p-5 rounded-xl flex items-center gap-4 hover:border-primary/50 transition-all group">
                      <div className="w-12 h-12 rounded-full bg-[#233648] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <Users className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-bold group-hover:text-primary transition-colors">{assistant.name}</span>
                        <span className="text-[#92adc9] text-[10px] uppercase font-black tracking-widest mt-0.5">{assistant.role || "Padėjėjas-Sekretorius"}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="ml-auto text-[#92adc9] hover:text-white">
                        <Mail className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center text-[#92adc9] font-medium border-2 border-dashed border-surface-border rounded-xl">
                    Padėjėjų duomenų nerasta.
                  </div>
                )}
              </div>
            )}

            {activeTab === "votes" && (
              <div className="bg-surface-dark border border-surface-border rounded-xl overflow-hidden animate-in fade-in duration-500">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-surface-border">
                      <th className="py-4 px-6 text-[#92adc9] text-[10px] uppercase font-bold tracking-widest">Data</th>
                      <th className="py-4 px-6 text-[#92adc9] text-[10px] uppercase font-bold tracking-widest">Pavadinimas</th>
                      <th className="py-4 px-6 text-[#92adc9] text-[10px] uppercase font-bold tracking-widest text-right">Sprendimas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {votesData?.map((item, idx) => {
                      const isFor = item.vote.voteValue === "for";
                      return (
                        <tr key={idx} className="group hover:bg-[#18232e] transition-colors">
                          <td className="py-4 px-6 text-white text-xs font-mono">
                            {item.vote.votedAt ? new Date(item.vote.votedAt).toLocaleDateString() : '—'}
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-white text-sm font-bold group-hover:text-primary transition-colors leading-tight block">
                              {item.bill?.title || "Balsavimas dėl teisės akto"}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                             <Badge className={`font-black text-[9px] uppercase tracking-widest ${
                               isFor ? "bg-accent-green/10 text-accent-green border-accent-green/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                             }`}>
                                {isFor ? "UŽ" : "PRIEŠ / SUSILAIKĖ"}
                             </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "trips" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
                {trips && trips.map((trip: any, idx) => (
                  <div key={idx} className="bg-surface-dark border border-surface-border p-6 rounded-xl relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors" />
                    <div className="flex justify-between items-start relative z-10">
                      <div className="flex flex-col gap-1">
                        <span className="text-[#92adc9] text-[10px] uppercase font-bold tracking-widest">Tikslas</span>
                        <h4 className="text-white text-xl font-black">{trip.destination}</h4>
                      </div>
                      <Globe className="w-6 h-6 text-primary" />
                    </div>
                    <div className="mt-8 flex justify-between items-end relative z-10">
                      <div className="flex flex-col gap-1">
                        <span className="text-[#92adc9] text-[10px] uppercase font-bold tracking-widest">Paskirtis</span>
                        <span className="text-white text-sm font-medium">{trip.purpose}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[#92adc9] text-[10px] uppercase font-bold tracking-widest">Kaina</span>
                        <span className="text-white font-mono font-black">€{trip.cost}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {(!trips || trips.length === 0) && (
                  <div className="col-span-full py-20 text-center text-[#92adc9] font-medium border-2 border-dashed border-surface-border rounded-xl">
                    Komandiruočių duomenų nerasta.
                  </div>
                )}
              </div>
            )}

            {activeTab === "biography" && (
              <div className="bg-surface-dark border border-surface-border p-8 rounded-xl animate-in fade-in duration-500">
                <h3 className="text-white text-lg font-black mb-6 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Profesinė Biografija
                </h3>
                <div className="prose prose-invert max-w-none">
                   <p className="text-[#92adc9] leading-loose text-base whitespace-pre-wrap">
                     {mp.biography || "Biografija šiuo metu nepasiekiama. Duomenys sinchronizuojami iš Seimo API."}
                   </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
