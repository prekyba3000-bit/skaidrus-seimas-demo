import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Share2,
  Heart,
  ExternalLink,
  Users,
  Compass,
  FileText,
  Activity,
  Award,
  Globe,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";

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

  if (mpLoading || !mpData) {
    return (
      <div className="min-h-screen bg-[#050a0f] flex items-center justify-center">
        <div className="text-center group">
          <div className="w-16 h-16 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-6 mx-auto" />
          <p className="text-emerald-500 font-mono text-xs tracking-widest uppercase animate-pulse">
            Initializing Dossier...
          </p>
        </div>
      </div>
    );
  }

  const { assistants, trips, ...mp } = mpData;

  const tabs = [
    { id: "overview", label: "Analitika", icon: Activity },
    { id: "assistants", label: "Komanda", icon: Users },
    { id: "votes", label: "Balsavimai", icon: FileText },
    { id: "trips", label: "Misijos", icon: Globe },
    { id: "biography", label: "Profilis", icon: Compass },
  ];

  return (
    <div className="min-h-screen bg-[#050a0f] text-slate-100 selection:bg-emerald-500/30 selection:text-white pb-32">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-emerald-500/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-500/5 blur-[150px] rounded-full" />
      </div>

      <header className="border-b border-white/5 bg-white/[0.02] backdrop-blur-md sticky top-0 z-50">
        <div className="container px-6 h-20 flex items-center justify-between">
          <Button
            variant="ghost"
            className="text-slate-400 hover:text-white gap-2 transition-all group"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-mono text-xs uppercase tracking-widest">
              Grįžti į registrą
            </span>
          </Button>

          <div className="flex items-center gap-4">
            <Badge
              variant="outline"
              className="border-emerald-500/30 text-emerald-400 font-mono text-[10px] tracking-widest uppercase py-1"
            >
              Dossier ID: {mp.seimasId}
            </Badge>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full hover:bg-white/5"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full hover:bg-white/5"
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container px-6 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left: Identity Module */}
          <div className="lg:col-span-4 lg:sticky lg:top-36 space-y-12">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500/50 to-cyan-500/50 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
              <div className="relative aspect-[4/5] bg-[#0c1218] border border-white/5 overflow-hidden rounded-sm">
                <Avatar className="w-full h-full rounded-none">
                  <AvatarImage
                    src={mp.photoUrl || undefined}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <AvatarFallback className="bg-white/5 text-6xl font-black">
                    {mp.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h1 className="text-4xl font-black uppercase tracking-tighter mb-2 leading-none">
                    {mp.name}
                  </h1>
                  <p className="text-emerald-500 font-mono text-[10px] tracking-[0.3em] uppercase">
                    {mp.party}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/5 rounded-sm hover:border-white/10 transition-colors">
                <div className="w-10 h-10 bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500">
                    Apygarda
                  </p>
                  <p className="font-bold">{mp.district || "Daugiamandatė"}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/5 rounded-sm hover:border-white/10 transition-colors">
                <div className="w-10 h-10 bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase font-bold text-slate-500">
                    Komunikacija
                  </p>
                  <p className="font-bold truncate">{mp.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/5 rounded-sm hover:border-white/10 transition-colors">
                <div className="w-10 h-10 bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500">
                    Būsena
                  </p>
                  <p className="font-bold text-emerald-400">Aktyvus Mandatas</p>
                </div>
              </div>
            </div>

            <Button className="w-full h-16 bg-white text-black font-black uppercase tracking-widest hover:bg-emerald-500 transition-colors rounded-sm">
              Oficiali Svetainė <ExternalLink className="h-4 w-4 ml-6" />
            </Button>
          </div>

          {/* Right: Data Core */}
          <div className="lg:col-span-8">
            <div className="flex items-center gap-2 mb-12 overflow-x-auto no-scrollbar pb-4 border-b border-white/5">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-8 py-4 transition-all whitespace-nowrap relative group ${
                      isActive
                        ? "text-emerald-400"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 transition-transform ${isActive ? "scale-110" : "group-hover:scale-110"}`}
                    />
                    <span className="font-bold uppercase tracking-widest text-[11px]">
                      {tab.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="min-h-[600px] relative">
              <AnimatePresence mode="wait">
                {activeTab === "overview" && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                  >
                    <div className="p-10 bg-white/[0.02] border border-white/5 rounded-sm relative overflow-hidden group">
                      <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative">
                        <p className="text-slate-500 font-mono text-[10px] tracking-widest uppercase mb-8">
                          Veiklos Indeksas
                        </p>
                        <div className="flex items-baseline gap-4 mb-8">
                          <span className="text-8xl font-black tracking-tighter text-white">
                            {stats ? parseFloat(stats.accountabilityScore) : 84}
                            %
                          </span>
                          <TrendingUp className="h-8 w-8 text-emerald-500" />
                        </div>
                        <Progress
                          value={
                            stats ? parseFloat(stats.accountabilityScore) : 84
                          }
                          className="h-1 bg-white/5"
                        />
                        <p className="mt-8 text-slate-400 leading-relaxed font-medium">
                          Skaičiuojama pagal dalyvavimą balsavimuose, teisėkūros
                          iniciatyvas ir deklaruojamą skaidrumą.
                        </p>
                      </div>
                    </div>

                    <div className="p-10 bg-white/[0.02] border border-white/5 rounded-sm relative overflow-hidden group">
                      <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative h-full flex flex-col">
                        <p className="text-slate-500 font-mono text-[10px] tracking-widest uppercase mb-8">
                          Frakcijos Lojalumas
                        </p>
                        <div className="flex items-baseline gap-4 mb-8">
                          <span className="text-8xl font-black tracking-tighter text-white">
                            {stats ? parseFloat(stats.partyLoyalty) : 92}%
                          </span>
                        </div>
                        <div className="mt-auto">
                          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">
                            <span>Konservatyvus</span>
                            <span>Radikalus</span>
                          </div>
                          <div className="h-1 w-full bg-white/5 flex gap-1">
                            <div className="h-full bg-cyan-500 w-[92%]" />
                            <div className="h-full bg-white/10 flex-1" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2 p-10 bg-white/[0.02] border border-white/5 rounded-sm">
                      <div className="flex items-center justify-between mb-12">
                        <h3 className="text-2xl font-black uppercase tracking-tighter">
                          Teisėkūros Balansas
                        </h3>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                              Pateikta
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-white/20" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                              Priimta
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                        <div>
                          <p className="text-4xl font-black mb-1">
                            {stats?.billsProposed || 24}
                          </p>
                          <p className="text-[10px] uppercase font-bold text-slate-500">
                            Projektai
                          </p>
                        </div>
                        <div>
                          <p className="text-4xl font-black mb-1">
                            {stats?.billsPassed || 8}
                          </p>
                          <p className="text-[10px] uppercase font-bold text-slate-500">
                            Patvirtinta
                          </p>
                        </div>
                        <div>
                          <p className="text-4xl font-black mb-1">
                            {Math.floor((stats?.billsProposed || 24) * 0.4)}
                          </p>
                          <p className="text-[10px] uppercase font-bold text-slate-500">
                            Komiteto svarst.
                          </p>
                        </div>
                        <div>
                          <p className="text-4xl font-black mb-1">12</p>
                          <p className="text-[10px] uppercase font-bold text-slate-500">
                            Pataisos
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "assistants" && (
                  <motion.div
                    key="assistants"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {assistants && assistants.length > 0 ? (
                      assistants.map((assistant: any) => (
                        <div
                          key={assistant.id}
                          className="p-8 bg-white/[0.02] border border-white/5 rounded-sm flex items-center justify-between group hover:border-emerald-500/30 transition-all"
                        >
                          <div className="space-y-2">
                            <p className="text-xl font-black tracking-tighter uppercase group-hover:text-emerald-400 transition-colors">
                              {assistant.name}
                            </p>
                            <div className="flex items-center gap-3">
                              <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 text-[10px] rounded-none px-3 py-1 border-none uppercase tracking-widest">
                                {assistant.role || "Padėjėjas"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="rounded-full hover:bg-emerald-500/20"
                            >
                              <Mail className="h-4 w-4 text-emerald-500" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="rounded-full hover:bg-emerald-500/20"
                            >
                              <Phone className="h-4 w-4 text-emerald-500" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-sm">
                        <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">
                          Personnel data unavailable
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "votes" && (
                  <motion.div
                    key="votes"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    {votesData && votesData.length > 0 ? (
                      votesData.map((item, index) => {
                        const v = item.vote;
                        const b = item.bill;
                        const isFor = v.voteValue === "for";
                        const isAgainst = v.voteValue === "against";

                        return (
                          <div
                            key={index}
                            className="flex items-center gap-8 p-6 bg-white/[0.02] border border-white/5 rounded-sm group hover:bg-white/[0.04] transition-all"
                          >
                            <div
                              className={`w-2 h-12 ${isFor ? "bg-emerald-500" : isAgainst ? "bg-red-500" : "bg-white/10"}`}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-2">
                                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                                  {v.votedAt
                                    ? new Date(v.votedAt).toLocaleDateString(
                                        "lt-LT"
                                      )
                                    : "Balsavimo data"}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="border-white/10 text-[9px] uppercase tracking-widest py-0"
                                >
                                  #{v.billId}
                                </Badge>
                              </div>
                              <p className="font-bold text-lg group-hover:text-white transition-colors leading-tight">
                                {b?.title || "Svarstomas įstatymo projektas"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p
                                className={`text-2xl font-black uppercase tracking-tighter ${isFor ? "text-emerald-500" : isAgainst ? "text-red-500" : "text-slate-500"}`}
                              >
                                {v.voteValue === "for"
                                  ? "Už"
                                  : v.voteValue === "against"
                                    ? "Prieš"
                                    : "Susilaikė"}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-sm">
                        <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">
                          Voting records inaccessible
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "biography" && (
                  <motion.div
                    key="bio"
                    initial={{ opacity: 0, filter: "blur(10px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    className="p-12 bg-white/[0.02] border border-white/5 rounded-sm prose prose-invert max-w-none"
                  >
                    <p className="text-xl text-slate-400 leading-relaxed font-serif italic">
                      {mp.biography ||
                        "Subject biography has not been uploaded to the central registry."}
                    </p>
                  </motion.div>
                )}

                {activeTab === "trips" && (
                  <motion.div
                    key="trips"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {trips && trips.length > 0 ? (
                      trips.map((trip: any) => (
                        <div
                          key={trip.id}
                          className="p-10 bg-white/[0.02] border border-white/5 rounded-sm relative overflow-hidden group"
                        >
                          <div className="absolute top-0 right-0 p-8">
                            <Award className="h-12 w-12 text-white/5 group-hover:text-emerald-500/10 transition-colors" />
                          </div>
                          <div className="space-y-6 relative">
                            <div>
                              <p className="text-slate-500 font-mono text-[10px] tracking-widest uppercase mb-2">
                                Paskirties vieta
                              </p>
                              <h4 className="text-4xl font-black uppercase tracking-tighter">
                                {trip.destination}
                              </h4>
                            </div>
                            <div className="flex flex-wrap gap-12">
                              <div>
                                <p className="text-slate-500 font-mono text-[10px] tracking-widest uppercase mb-1">
                                  Finansavimas
                                </p>
                                <p className="text-2xl font-black text-emerald-400">
                                  {parseFloat(trip.cost).toLocaleString(
                                    "lt-LT",
                                    { style: "currency", currency: "EUR" }
                                  )}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-500 font-mono text-[10px] tracking-widest uppercase mb-1">
                                  Periodas
                                </p>
                                <p className="text-lg font-bold">
                                  {trip.startDate
                                    ? new Date(
                                        trip.startDate
                                      ).toLocaleDateString("lt-LT")
                                    : ""}{" "}
                                  —{" "}
                                  {trip.endDate
                                    ? new Date(trip.endDate).toLocaleDateString(
                                        "lt-LT"
                                      )
                                    : ""}
                                </p>
                              </div>
                            </div>
                            <div>
                              <p className="text-slate-500 font-mono text-[10px] tracking-widest uppercase mb-2">
                                Misijos tikslas
                              </p>
                              <p className="text-slate-400 leading-relaxed">
                                {trip.purpose}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-sm">
                        <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">
                          Foreign mission logs empty
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* Dossier Footer Scanline */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-emerald-500/20 backdrop-blur-3xl overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="h-full w-1/3 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,1)]"
        />
      </div>
    </div>
  );
}
