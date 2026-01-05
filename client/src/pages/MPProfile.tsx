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
  Target,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";

const NEON_CYAN = "text-[#00ffff]";
const NEON_PINK = "text-[#ff00ff]";

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
      <div className="min-h-screen bg-[#020406] flex items-center justify-center font-mono">
        <div className="text-center group">
          <div className="w-16 h-16 border-2 border-[#00ffff]/20 border-t-[#00ffff] rounded-full animate-spin mb-6 mx-auto shadow-[0_0_20px_#00ffff]/20" />
          <p className="text-[#00ffff] text-xs tracking-[0.5em] uppercase animate-pulse font-black">
            Decrypting_Dossier_Link...
          </p>
        </div>
      </div>
    );
  }

  const { assistants, trips, ...mp } = mpData;

  const tabs = [
    { id: "overview", label: "INTEL_ANALYTICS", icon: Activity },
    { id: "assistants", label: "SQUAD_UNITS", icon: Users },
    { id: "votes", label: "LOG_HISTORY", icon: FileText },
    { id: "trips", label: "FIELD_OPS", icon: Globe },
    { id: "biography", label: "ENTITY_PROFILE", icon: Compass },
  ];

  return (
    <div className="min-h-screen bg-[#020406] text-slate-100 selection:bg-[#ff00ff]/30 selection:text-white pb-32 font-mono">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:60px_60px]">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-[#ff00ff]/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-[#00ffff]/5 blur-[150px] rounded-full" />
      </div>

      <header className="border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="container px-6 h-20 flex items-center justify-between">
          <Button
            variant="ghost"
            className="text-slate-500 hover:text-[#00ffff] gap-2 transition-all group font-black"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] uppercase tracking-[0.3em]">
              EXIT_DOSSIER
            </span>
          </Button>

          <div className="flex items-center gap-4">
            <Badge
              variant="outline"
              className="border-[#00ffff]/30 text-[#00ffff] text-[10px] tracking-widest uppercase py-1 bg-[#00ffff]/5 rounded-none"
            >
              OP_CODE: {mp.seimasId}
            </Badge>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full hover:bg-white/5 text-slate-500 hover:text-white"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full hover:bg-white/5 text-slate-500 hover:text-[#ff00ff]"
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
              <div className="absolute -inset-1 bg-gradient-to-br from-[#ff00ff]/50 to-[#00ffff]/50 blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
              <div className="relative aspect-[4/5] bg-black border border-white/10 overflow-hidden">
                <Avatar className="w-full h-full rounded-none">
                  <AvatarImage
                    src={mp.photoUrl || undefined}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <AvatarFallback className="bg-white/5 text-6xl font-black text-slate-800">
                    {mp.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-8">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-3 w-3 text-[#ff00ff]" />
                    <p className="text-[#ff00ff] text-[10px] tracking-[0.4em] uppercase font-black">
                      {mp.party}
                    </p>
                  </div>
                  <h1 className="text-4xl font-black uppercase tracking-tighter leading-none text-white">
                    {mp.name}
                  </h1>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="group flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 hover:border-[#00ffff]/30 transition-all">
                <div className="w-10 h-10 border border-[#00ffff]/20 flex items-center justify-center text-[#00ffff] group-hover:bg-[#00ffff]/10">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[8px] uppercase font-black text-slate-600 tracking-widest">
                    Operation_Zone
                  </p>
                  <p className="font-black text-sm">
                    {mp.district || "CENTRAL_REGISTRY"}
                  </p>
                </div>
              </div>

              <div className="group flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 hover:border-[#ff00ff]/30 transition-all">
                <div className="w-10 h-10 border border-[#ff00ff]/20 flex items-center justify-center text-[#ff00ff] group-hover:bg-[#ff00ff]/10">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[8px] uppercase font-black text-slate-600 tracking-widest">
                    Comm_Link
                  </p>
                  <p className="font-black text-sm truncate">{mp.email}</p>
                </div>
              </div>

              <div className="group flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 hover:border-[#ccff00]/30 transition-all">
                <div className="w-10 h-10 border border-[#ccff00]/20 flex items-center justify-center text-[#ccff00] group-hover:bg-[#ccff00]/10">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[8px] uppercase font-black text-slate-600 tracking-widest">
                    Unit_Status
                  </p>
                  <p className="font-black text-sm text-[#ccff00]">
                    ACTIVE_MANDATE
                  </p>
                </div>
              </div>
            </div>

            <Button className="w-full h-16 bg-[#00ffff] text-black font-black uppercase tracking-widest hover:bg-white transition-all rounded-none shadow-[0_0_20px_rgba(0,255,255,0.2)]">
              SYNC_OFFICIAL_FEED <ExternalLink className="h-4 w-4 ml-6" />
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
                        ? "text-[#00ffff]"
                        : "text-slate-600 hover:text-slate-300"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 transition-transform ${isActive ? "scale-110" : "group-hover:scale-110"}`}
                    />
                    <span className="font-black uppercase tracking-[0.2em] text-[10px]">
                      {tab.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTabProfile"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-[#00ffff] shadow-[0_0_15px_#00ffff]"
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
                    <div className="p-10 bg-white/[0.01] border border-white/5 rounded-none relative overflow-hidden group">
                      <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#00ffff]/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative">
                        <p className="text-slate-600 font-black text-[8px] tracking-[0.4em] uppercase mb-8">
                          Performance_Metric
                        </p>
                        <div className="flex items-baseline gap-4 mb-8">
                          <span
                            className={`text-8xl font-black tracking-tighter ${NEON_CYAN}`}
                          >
                            {stats ? parseFloat(stats.accountabilityScore) : 84}
                            %
                          </span>
                          <TrendingUp className="h-8 w-8 text-[#00ffff]" />
                        </div>
                        <Progress
                          value={
                            stats ? parseFloat(stats.accountabilityScore) : 84
                          }
                          className="h-1 bg-white/5 rounded-none"
                        />
                        <p className="mt-8 text-slate-500 leading-relaxed font-bold text-xs uppercase tracking-widest">
                          Calculated based on voting stream participation,
                          legislative frequency, and transparency logs.
                        </p>
                      </div>
                    </div>

                    <div className="p-10 bg-white/[0.01] border border-white/5 rounded-none relative overflow-hidden group">
                      <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#ff00ff]/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative h-full flex flex-col">
                        <p className="text-slate-600 font-black text-[8px] tracking-[0.4em] uppercase mb-8">
                          Faction_Sync_Rate
                        </p>
                        <div className="flex items-baseline gap-4 mb-8">
                          <span
                            className={`text-8xl font-black tracking-tighter ${NEON_PINK}`}
                          >
                            {stats ? parseFloat(stats.partyLoyalty) : 92}%
                          </span>
                        </div>
                        <div className="mt-auto">
                          <div className="flex justify-between text-[7px] font-black uppercase tracking-widest text-slate-600 mb-4">
                            <span>Conservative_Bias</span>
                            <span>Radical_Bias</span>
                          </div>
                          <div className="h-1 w-full bg-white/5 flex gap-1">
                            <div className="h-full bg-[#ff00ff] w-[92%]" />
                            <div className="h-full bg-white/10 flex-1" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2 p-10 bg-white/[0.01] border border-white/5 rounded-none">
                      <div className="flex items-center justify-between mb-12">
                        <h3 className="text-2xl font-black uppercase tracking-tighter italic">
                          Legislative_Load
                        </h3>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00ffff]" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">
                              INPUT
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#ff00ff]" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">
                              OUTPUT
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                        <div>
                          <p className="text-4xl font-black mb-1">
                            {stats?.billsProposed || 24}
                          </p>
                          <p className="text-[8px] uppercase font-black text-slate-600 tracking-widest">
                            Proposed
                          </p>
                        </div>
                        <div>
                          <p className="text-4xl font-black mb-1">
                            {stats?.billsPassed || 8}
                          </p>
                          <p className="text-[8px] uppercase font-black text-slate-600 tracking-widest">
                            Validated
                          </p>
                        </div>
                        <div>
                          <p className="text-4xl font-black mb-1">
                            {Math.floor((stats?.billsProposed || 24) * 0.4)}
                          </p>
                          <p className="text-[8px] uppercase font-black text-slate-600 tracking-widest">
                            In_Review
                          </p>
                        </div>
                        <div>
                          <p className="text-4xl font-black mb-1">12</p>
                          <p className="text-[8px] uppercase font-black text-slate-600 tracking-widest">
                            Patches
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "assistants" && (
                  <motion.div
                    key="assistants"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {assistants && assistants.length > 0 ? (
                      assistants.map((assistant: any) => (
                        <div
                          key={assistant.id}
                          className="p-8 bg-white/[0.01] border border-white/5 rounded-none flex items-center justify-between group hover:border-[#00ffff]/30 transition-all"
                        >
                          <div className="space-y-2">
                            <p className="text-lg font-black tracking-tighter uppercase group-hover:text-[#00ffff] transition-colors">
                              {assistant.name}
                            </p>
                            <div className="flex items-center gap-3">
                              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#ccff00]">
                                {assistant.role || "FIELD_SUPPORT"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="rounded-none hover:text-[#00ffff]"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="rounded-none hover:text-[#00ffff]"
                            >
                              <Phone className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-none">
                        <p className="text-slate-700 text-[10px] font-black uppercase tracking-[0.5em]">
                          No_Personnel_Detected
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "votes" && (
                  <motion.div
                    key="votes"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
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
                            className="flex items-center gap-8 p-6 bg-white/[0.01] border border-white/5 rounded-none group hover:bg-white/[0.03] transition-all"
                          >
                            <div
                              className={`w-1 h-10 ${isFor ? "bg-[#ccff00]" : isAgainst ? "bg-[#ff00ff]" : "bg-slate-800"}`}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-1">
                                <span className="text-[7px] font-black text-slate-700 uppercase tracking-[0.3em]">
                                  {v.votedAt
                                    ? new Date(v.votedAt).toLocaleDateString()
                                    : "UNKNOWN_TIMESTAMP"}
                                </span>
                                <span className="text-[7px] font-black text-[#00ffff] tracking-widest">
                                  ID://{v.billId}
                                </span>
                              </div>
                              <p className="font-black text-md group-hover:text-white transition-colors leading-tight uppercase tracking-tighter">
                                {b?.title || "PROTO_FILE_UNDESIGNATED"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p
                                className={`text-xl font-black uppercase tracking-tighter ${isFor ? "text-[#ccff00]" : isAgainst ? "text-[#ff00ff]" : "text-slate-800"}`}
                              >
                                {v.voteValue === "for"
                                  ? "YES"
                                  : v.voteValue === "against"
                                    ? "NO"
                                    : "ABSTAIN"}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-none">
                        <p className="text-slate-700 text-[10px] font-black uppercase tracking-[0.5em]">
                          Log_Stream_Empty
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "biography" && (
                  <motion.div
                    key="bio"
                    initial={{ opacity: 0, filter: "blur(5px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    className="p-12 bg-white/[0.01] border border-white/5 rounded-none max-w-none"
                  >
                    <p className="text-md text-slate-500 leading-relaxed uppercase tracking-widest font-bold">
                      {mp.biography ||
                        "No dossier data found in central intelligence agency. Subject remains an unmapped entity."}
                    </p>
                  </motion.div>
                )}

                {activeTab === "trips" && (
                  <motion.div
                    key="trips"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {trips && trips.length > 0 ? (
                      trips.map((trip: any) => (
                        <div
                          key={trip.id}
                          className="p-10 bg-white/[0.01] border border-white/5 rounded-none relative overflow-hidden group"
                        >
                          <div className="absolute top-0 right-0 p-8">
                            <Globe className="h-12 w-12 text-white/5 group-hover:text-[#00ffff]/10 transition-colors" />
                          </div>
                          <div className="space-y-6 relative">
                            <div>
                              <p className="text-slate-600 font-black text-[8px] tracking-[0.4em] uppercase mb-2">
                                TARGET_LOCATION
                              </p>
                              <h4 className="text-4xl font-black uppercase tracking-tighter italic text-white">
                                {trip.destination}
                              </h4>
                            </div>
                            <div className="flex flex-wrap gap-12">
                              <div>
                                <p className="text-slate-600 font-black text-[8px] tracking-[0.4em] uppercase mb-1">
                                  MISSION_BUDGET
                                </p>
                                <p className="text-2xl font-black text-[#ccff00]">
                                  €{parseFloat(trip.cost).toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-600 font-black text-[8px] tracking-[0.4em] uppercase mb-1">
                                  WINDOW
                                </p>
                                <p className="text-md font-black">
                                  {trip.startDate
                                    ? new Date(
                                        trip.startDate
                                      ).toLocaleDateString()
                                    : "??"}{" "}
                                  {" >> "}{" "}
                                  {trip.endDate
                                    ? new Date(
                                        trip.endDate
                                      ).toLocaleDateString()
                                    : "??"}
                                </p>
                              </div>
                            </div>
                            <div>
                              <p className="text-slate-600 font-black text-[8px] tracking-[0.4em] uppercase mb-2">
                                MISSION_OBJECTIVE
                              </p>
                              <p className="text-slate-500 font-bold text-xs uppercase tracking-widest leading-loose">
                                {trip.purpose}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-none">
                        <p className="text-slate-700 text-[10px] font-black uppercase tracking-[0.5em]">
                          No_Mission_Logs_Found
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

      {/* Dossier Terminal Scanline */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-[#00ffff]/10 backdrop-blur-3xl overflow-hidden pointer-events-none z-[100]">
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="h-full w-1/4 bg-[#00ffff] shadow-[0_0_20px_#00ffff]"
        />
      </div>
    </div>
  );
}
