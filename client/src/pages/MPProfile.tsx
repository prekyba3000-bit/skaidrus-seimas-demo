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
  Leaf
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { BalticPatternBorder } from "@/components/BalticPatternBorder";

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
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center font-serif">
        <div className="text-center group">
          <div className="w-16 h-16 rounded-full border-4 border-[var(--amber-start)] border-t-transparent animate-spin mb-6 mx-auto" />
          <p className="text-[var(--amber-end)] tracking-widest uppercase animate-pulse">
            Pasiekiama informacija...
          </p>
        </div>
      </div>
    );
  }

  const { assistants, trips, ...mp } = mpData;

  const tabs = [
    { id: "overview", label: "Apžvalga", icon: Activity },
    { id: "assistants", label: "Komanda", icon: Users }, // Assistants tab
    { id: "votes", label: "Balsavimai", icon: FileText },
    { id: "trips", label: "Komandiruotės", icon: Globe },
    { id: "biography", label: "Biografija", icon: Compass },
  ];

  // Tree of Life Animation Variants
  const treeContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const treeBranch = {
    hidden: { opacity: 0, x: -20, scaleY: 0 },
    show: { opacity: 1, x: 0, scaleY: 1 }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-32">
      {/* Background Ambience */}
      <div className="grain-overlay" />
      <div className="fixed inset-0 baltic-pattern-bg pointer-events-none" />

      {/* Header */}
      <header className="border-b border-[var(--amber-end)]/20 bg-[var(--background)]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container px-6 h-20 flex items-center justify-between">
          <Button
            variant="ghost"
            className="text-[var(--muted-foreground)] hover:text-[var(--amber-start)] gap-2 transition-all group"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs uppercase tracking-widest font-serif">
              Grįžti į sąrašą
            </span>
          </Button>

          <div className="flex items-center gap-4">
            {/* ID Badge resembling an artifact label */}
            <div className="border border-[var(--amber-start)]/30 px-3 py-1 bg-[var(--amber-start)]/5">
              <span className="text-[var(--amber-end)] text-[10px] tracking-widest uppercase font-serif">
                Kortelė: #{mp.seimasId}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container px-6 pt-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left: Identity Column */}
          <div className="lg:col-span-4 lg:sticky lg:top-36 space-y-8">
            <BalticPatternBorder variant="sun">
              <div className="relative group overflow-hidden bg-[var(--card)]/90">
                {/* Amber Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-br from-[var(--amber-start)]/30 to-transparent blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />

                <div className="relative aspect-[4/5] overflow-hidden">
                  <Avatar className="w-full h-full rounded-none">
                    <AvatarImage
                      src={mp.photoUrl || undefined}
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <AvatarFallback className="bg-[var(--muted)] text-6xl font-serif text-[var(--muted-foreground)]">
                      {mp.name[0]}
                    </AvatarFallback>
                  </Avatar>

                  {/* Name Overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--peat-oak)] via-[var(--peat-oak)]/80 to-transparent p-8">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-3 w-3 text-[var(--amber-start)]" />
                      <p className="text-[var(--amber-start)] text-[10px] tracking-[0.2em] uppercase font-bold">
                        {mp.party}
                      </p>
                    </div>
                    <h1 className="text-3xl font-serif font-bold uppercase tracking-tight leading-none text-[var(--linen-white)]">
                      {mp.name}
                    </h1>
                  </div>
                </div>
              </div>
            </BalticPatternBorder>

            <div className="space-y-4 font-serif">
              <div className="flex items-center gap-4 p-4 border-b border-[var(--amber-start)]/10">
                <div className="w-10 h-10 rounded-full bg-[var(--amber-start)]/10 flex items-center justify-center text-[var(--amber-end)]">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] tracking-widest">
                    Apygarda
                  </p>
                  <p className="font-medium text-sm">
                    {mp.district || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 border-b border-[var(--amber-start)]/10">
                <div className="w-10 h-10 rounded-full bg-[var(--amber-start)]/10 flex items-center justify-center text-[var(--amber-end)]">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] tracking-widest">
                    El. Paštas
                  </p>
                  <p className="font-medium text-sm truncate">{mp.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 border-b border-[var(--amber-start)]/10">
                <div className="w-10 h-10 rounded-full bg-[var(--amber-start)]/10 flex items-center justify-center text-[var(--amber-end)]">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] tracking-widest">
                    Statusas
                  </p>
                  <p className="font-medium text-sm text-[var(--copper-moss)]">
                    Aktyvus Mandatas
                  </p>
                </div>
              </div>
            </div>

            <Button className="w-full h-14 bg-[var(--amber-end)] hover:bg-[var(--amber-start)] text-white font-serif uppercase tracking-widest transition-all shadow-lg hover:shadow-[var(--amber-start)]/50">
              Oficialus Puslapis <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Right: Content Area */}
          <div className="lg:col-span-8">
            {/* Custom Tab Navigation */}
            <div className="flex items-center gap-2 mb-12 overflow-x-auto no-scrollbar pb-4 border-b border-[var(--amber-start)]/20">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-6 py-3 transition-all whitespace-nowrap relative group ${isActive
                        ? "text-[var(--amber-end)] bg-[var(--amber-start)]/5"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                      }`}
                  >
                    <Icon
                      className={`h-4 w-4 transition-transform ${isActive ? "scale-110" : "group-hover:scale-110"}`}
                    />
                    <span className="font-bold uppercase tracking-wider text-xs font-serif">
                      {tab.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTabProfile"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--amber-end)]"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="min-h-[500px] relative">
              <AnimatePresence mode="wait">
                {/* OVERVIEW TAB */}
                {activeTab === "overview" && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                  >

                    {/* Accountability Card */}
                    <BalticPatternBorder className="col-span-1">
                      <div className="p-8 bg-[var(--card)]/60 relative overflow-hidden h-full">
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[var(--amber-start)]/10 rounded-full blur-2xl" />
                        <p className="text-[var(--muted-foreground)] font-serif italic mb-4">Atskaitomybės reitingas</p>
                        <div className="flex items-baseline gap-4 mb-6">
                          <span className="text-6xl font-bold text-[var(--amber-end)] font-serif">
                            {stats ? parseFloat(stats.accountabilityScore) : 84}%
                          </span>
                          <TrendingUp className="h-6 w-6 text-[var(--copper-moss)]" />
                        </div>
                        <Progress value={stats ? parseFloat(stats.accountabilityScore) : 84} className="h-2 bg-[var(--muted)]" indicatorClassName="bg-[var(--amber-end)]" />
                      </div>
                    </BalticPatternBorder>

                    {/* Loyalty Card */}
                    <BalticPatternBorder className="col-span-1">
                      <div className="p-8 bg-[var(--card)]/60 relative overflow-hidden h-full">
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[var(--copper-moss)]/10 rounded-full blur-2xl" />
                        <p className="text-[var(--muted-foreground)] font-serif italic mb-4">Frakcijos lojalumas</p>
                        <div className="flex items-baseline gap-4 mb-6">
                          <span className="text-6xl font-bold text-[var(--copper-moss)] font-serif">
                            {stats ? parseFloat(stats.partyLoyalty) : 92}%
                          </span>
                        </div>
                        <div className="text-xs text-[var(--muted-foreground)] mt-2">Balsavimų sutapimas su frakcija</div>
                      </div>
                    </BalticPatternBorder>

                    {/* Stats Grid */}
                    <div className="md:col-span-2">
                      <BalticPatternBorder>
                        <div className="p-8 bg-[var(--card)]/60">
                          <h3 className="text-xl font-serif font-bold mb-8 text-[var(--foreground)]">Teisėkūra</h3>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="text-center">
                              <p className="text-3xl font-bold text-[var(--amber-end)] mb-1">{stats?.billsProposed || 0}</p>
                              <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)]">Pateikta</p>
                            </div>
                            <div className="text-center">
                              <p className="text-3xl font-bold text-[var(--copper-moss)] mb-1">{stats?.billsPassed || 0}</p>
                              <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)]">Priimta</p>
                            </div>
                            <div className="text-center">
                              <p className="text-3xl font-bold text-[var(--foreground)] mb-1">{(stats?.billsProposed || 0) * 2}</p>
                              <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)]">Pasiūlymai</p>
                            </div>
                            <div className="text-center">
                              <p className="text-3xl font-bold text-[var(--foreground)] mb-1">{Math.floor((stats?.votingAttendance ? parseFloat(stats.votingAttendance) : 0) / 10)}</p>
                              <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)]">Kalbos</p>
                            </div>
                          </div>
                        </div>
                      </BalticPatternBorder>
                    </div>
                  </motion.div>
                )}

                {/* ASSISTANTS TAB - TREE OF LIFE */}
                {activeTab === "assistants" && (
                  <div className="relative pl-8 border-l-2 border-[var(--amber-start)]/20 ml-4 py-4">
                    {/* The Main Trunk is the border-left above */}
                    <motion.div
                      variants={treeContainer}
                      initial="hidden"
                      animate="show"
                      exit="hidden"
                      className="space-y-8"
                    >
                      {assistants && assistants.length > 0 ? (
                        assistants.map((assistant: any, idx) => (
                          <motion.div
                            key={assistant.id}
                            variants={treeBranch}
                            className="relative"
                          >
                            {/* Branch Connector */}
                            <div className="absolute -left-10 top-1/2 w-8 h-px bg-[var(--amber-start)]/30" />
                            <div className="absolute -left-[34px] top-1/2 w-2 h-2 rounded-full bg-[var(--amber-start)] -translate-y-[50%]" />

                            <BalticPatternBorder variant="simple">
                              <div className="p-6 bg-[var(--card)]/80 flex items-center justify-between group hover:bg-[var(--background)] transition-colors">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-full bg-[var(--amber-start)]/10 flex items-center justify-center text-[var(--amber-end)]">
                                    <Leaf className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <p className="text-lg font-bold font-serif text-[var(--foreground)] group-hover:text-[var(--amber-end)] transition-colors">
                                      {assistant.name}
                                    </p>
                                    <span className="text-xs font-bold uppercase tracking-widest text-[var(--copper-moss)]">
                                      {assistant.role || "Padėjėjas-Sekretorius"}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                  <Button size="sm" variant="ghost" className="hover:text-[var(--amber-end)]">
                                    <Mail className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </BalticPatternBorder>
                          </motion.div>
                        ))
                      ) : (
                        <div className="py-20 text-center text-[var(--muted-foreground)] italic font-serif">
                          <p>Nėra registruotų padėjėjų.</p>
                        </div>
                      )}
                    </motion.div>
                  </div>
                )}

                {/* VOTES TAB */}
                {activeTab === "votes" && (
                  <motion.div
                    key="votes"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {votesData && votesData.map((item, index) => {
                      const isFor = item.vote.voteValue === "for";
                      return (
                        <BalticPatternBorder key={index} variant="simple">
                          <div className="p-4 bg-[var(--card)]/50 flex items-center gap-4">
                            <div className={`w-1 h-12 ${isFor ? 'bg-[var(--copper-moss)]' : 'bg-[var(--destructive)]'}`} />
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)]">{item.vote.votedAt ? new Date(item.vote.votedAt).toLocaleDateString() : '—'}</span>
                                <span className={`text-xs font-bold uppercase ${isFor ? 'text-[var(--copper-moss)]' : 'text-[var(--destructive)]'}`}>
                                  {isFor ? 'UŽ' : 'PRIEŠ / SUSILAIKĖ'}
                                </span>
                              </div>
                              <p className="font-serif leading-tight text-sm text-[var(--foreground)]">
                                {item.bill?.title || "Balsavimas dėl teisės akto"}
                              </p>
                            </div>
                          </div>
                        </BalticPatternBorder>
                      );
                    })}
                    {(!votesData || votesData.length === 0) && (
                      <div className="py-20 text-center text-[var(--muted-foreground)]">Duomenų nėra.</div>
                    )}
                  </motion.div>
                )}

                {/* BIO TAB */}
                {activeTab === "biography" && (
                  <motion.div
                    key="bio"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-8 bg-[var(--card)]/50 border border-[var(--amber-start)]/10 font-serif leading-loose text-lg text-[var(--foreground)]"
                  >
                    {mp.biography || "Biografija nepateikta."}
                  </motion.div>
                )}

                {/* TRIPS TAB */}
                {activeTab === "trips" && (
                  <motion.div
                    key="trips"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid gap-6"
                  >
                    {trips && trips.map((trip: any, idx) => (
                      <BalticPatternBorder key={idx}>
                        <div className="p-6 bg-[var(--card)]/60 relative">
                          <div className="absolute top-4 right-4 text-[var(--amber-start)]/20">
                            <Globe className="w-12 h-12" />
                          </div>
                          <h4 className="text-xl font-bold font-serif mb-2 text-[var(--foreground)]">{trip.destination}</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                            <div>
                              <span className="text-[10px] uppercase text-[var(--muted-foreground)] block">Tipas</span>
                              <span className="font-medium">{trip.purpose}</span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase text-[var(--muted-foreground)] block">Kaina</span>
                              <span className="font-medium font-mono">€{trip.cost}</span>
                            </div>
                          </div>
                        </div>
                      </BalticPatternBorder>
                    ))}
                    {(!trips || trips.length === 0) && (
                      <div className="py-20 text-center text-[var(--muted-foreground)]">Komandiruotės nerastos.</div>
                    )}
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
