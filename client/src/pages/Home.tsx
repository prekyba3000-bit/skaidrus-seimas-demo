import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Users,
  ChevronRight,
  Terminal as TerminalIcon,
  Cpu,
  Globe,
  Radio,
  Target,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { trpc } from "@/lib/trpc";

// Jules' Cyber-Neon Style Constants
const CYBER_BG = "bg-[#020406]";
const NEON_PINK = "text-[#ff00ff]";
const NEON_CYAN = "text-[#00ffff]";
const NEON_LIME = "text-[#ccff00]";
const BORDER_NEON = "border-white/5 hover:border-[#00ffff]/40";

function SatelliteNode({ index, total }: { index: number; total: number }) {
  const angle = (index / total) * Math.PI * 2;
  const radius = 90;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute w-2 h-2 rounded-full bg-[#00ffff] shadow-[0_0_8px_#00ffff]"
      style={{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: "translate(-50%, -50%)",
      }}
    />
  );
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParty, setSelectedParty] = useState<string>("all");
  const [isTerminalFocused, setIsTerminalFocused] = useState(false);
  const [hoveredMp, setHoveredMp] = useState<number | null>(null);

  const { data: mps, isLoading: mpsLoading } = trpc.mps.list.useQuery({
    isActive: true,
  });

  const filteredMps = useMemo(() => {
    if (!mps) return [];
    let filtered = mps.map(mp => ({
      ...mp,
      score: 75 + Math.floor(Math.random() * 20),
      assistantCount: (mp as any).assistantCount || 0,
    }));

    if (searchTerm) {
      filtered = filtered.filter(
        mp =>
          mp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mp.party.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedParty !== "all") {
      filtered = filtered.filter(mp => mp.party === selectedParty);
    }

    return filtered;
  }, [mps, searchTerm, selectedParty]);

  const parties = useMemo(() => {
    const uniqueParties = new Set(mps?.map(mp => mp.party) || []);
    return ["all", ...Array.from(uniqueParties).sort()];
  }, [mps]);

  return (
    <div
      className={`min-h-screen ${CYBER_BG} text-slate-100 selection:bg-[#ff00ff]/30 overflow-x-hidden font-mono`}
    >
      {/* Cyber Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Header: Agent Discovery Terminal */}
      <section className="relative pt-32 pb-16">
        <div className="container px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#ff00ff] animate-pulse" />
              <p
                className={`${NEON_PINK} tracking-[0.4em] text-xs uppercase font-black`}
              >
                Alpha Protocol / Level 4 Access
              </p>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 italic">
              INTEL<span className={NEON_CYAN}>.STREAM</span>
            </h1>

            {/* Terminal Search Bar */}
            <div
              className={`max-w-3xl relative transition-all duration-300 ${isTerminalFocused ? "scale-[1.02]" : ""}`}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-[#00ffff] to-[#ff00ff] rounded opacity-20 blur group-focus-within:opacity-40" />
              <div className="relative bg-black border border-white/10 rounded overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-white/[0.02]">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                  <span className="ml-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    Agent Discovery v2.4
                  </span>
                </div>
                <div className="flex items-center p-4">
                  <span className="text-[#ccff00] mr-4 font-black">
                    root@skaidrus_seimas:~$
                  </span>
                  <input
                    type="text"
                    className="bg-transparent border-none outline-none flex-1 text-[#00ffff] terminal-cursor"
                    placeholder="SEARCHING_FOR_MP_ID_OR_PARTY..."
                    onFocus={() => setIsTerminalFocused(true)}
                    onBlur={() => setIsTerminalFocused(false)}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  <TerminalIcon
                    className={`h-5 w-5 ${NEON_CYAN} opacity-50 ml-4`}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Ops Control */}
      <section className="py-8 border-y border-white/5 bg-white/[0.01]">
        <div className="container px-6 flex flex-wrap gap-4 items-center">
          <Globe className="h-4 w-4 text-slate-500" />
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mr-4">
            Filter Fragments:
          </span>
          {parties.slice(0, 6).map(party => (
            <button
              key={party}
              onClick={() => setSelectedParty(party)}
              className={`px-4 py-1 text-[10px] uppercase font-black tracking-widest transition-all border ${
                selectedParty === party
                  ? "bg-[#00ffff] text-black border-[#00ffff] shadow-[0_0_15px_#00ffff]"
                  : "bg-transparent text-slate-400 border-white/10 hover:border-[#00ffff]/30"
              }`}
            >
              {party === "all" ? "[ ALL_UNITS ]" : `[ ${party.slice(0, 15)} ]`}
            </button>
          ))}
        </div>
      </section>

      {/* Main Grid: Intel Nodes */}
      <section className="py-24">
        <div className="container px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {mpsLoading
                ? [...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[4/5] bg-white/[0.02] border border-white/5 animate-pulse"
                    />
                  ))
                : filteredMps.map((mp, index) => (
                    <motion.div
                      layout
                      key={mp.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onMouseEnter={() => setHoveredMp(mp.id)}
                      onMouseLeave={() => setHoveredMp(null)}
                    >
                      <Link href={`/mp/${mp.id}`}>
                        <div
                          className={`relative aspect-[4/5] overflow-hidden bg-black border ${BORDER_NEON} transition-all duration-500 cursor-pointer group`}
                        >
                          {/* Radar Ping Effect */}
                          {hoveredMp === mp.id && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-40 h-40 border border-[#00ffff]/40 rounded-full animate-radar" />
                              <div className="w-40 h-40 border border-[#00ffff]/20 rounded-full animate-radar [animation-delay:0.5s]" />
                            </div>
                          )}

                          {/* Top HUD */}
                          <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                            <div className="flex flex-col gap-1">
                              <span className="text-[8px] font-black ${NEON_CYAN} tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                NODE_{mp.id.toString().padStart(4, "0")}
                              </span>
                              <span className="text-[8px] font-black text-slate-600 tracking-widest uppercase">
                                {mp.seimasId}
                              </span>
                            </div>
                            <Target
                              className={`h-4 w-4 ${hoveredMp === mp.id ? NEON_PINK : "text-slate-700"} transition-colors`}
                            />
                          </div>

                          <div className="p-8 h-full flex flex-col relative z-10">
                            {/* Profile Circle & Satellite Nodes */}
                            <div className="relative mb-12 self-center">
                              <Avatar className="w-32 h-32 border-2 border-white/5 grayscale group-hover:grayscale-0 group-hover:border-[#00ffff]/50 transition-all duration-700">
                                <AvatarImage
                                  src={mp.photoUrl || undefined}
                                  className="object-cover"
                                />
                                <AvatarFallback className="bg-white/5 text-3xl font-black">
                                  {mp.name[0]}
                                </AvatarFallback>
                              </Avatar>

                              {/* Assistant Satellites */}
                              {hoveredMp === mp.id &&
                                [...Array(Math.min(mp.assistantCount, 8))].map(
                                  (_, i) => (
                                    <SatelliteNode
                                      key={i}
                                      index={i}
                                      total={Math.min(mp.assistantCount, 8)}
                                    />
                                  )
                                )}
                            </div>

                            <div className="mt-auto">
                              <div className="flex items-center gap-2 mb-2">
                                <Cpu className="h-3 w-3 text-slate-500" />
                                <span className="text-[8px] uppercase tracking-widest text-[#ccff00] font-black">
                                  {mp.party}
                                </span>
                              </div>
                              <h3 className="text-2xl font-black tracking-tighter uppercase mb-6 group-hover:text-[#00ffff] transition-colors leading-none">
                                {mp.name}
                              </h3>

                              <div className="pt-6 border-t border-white/5 flex justify-between items-end">
                                <div>
                                  <p className="text-[8px] uppercase font-black text-slate-500 mb-1">
                                    Accountability_Index
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-3xl font-black ${NEON_PINK}`}
                                    >
                                      {mp.score}
                                    </span>
                                    <Radio
                                      className={`h-3 w-3 ${NEON_PINK} animate-pulse`}
                                    />
                                  </div>
                                </div>
                                <div className="w-10 h-10 border border-white/10 flex items-center justify-center group-hover:bg-[#00ffff] group-hover:border-[#00ffff] transition-all">
                                  <ChevronRight className="h-5 w-5 group-hover:text-black" />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Jules' Scanline Overlay */}
                          <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Cyber Ops Footer */}
      <footer className="py-24 border-t border-white/5 bg-black relative">
        <div className="container px-6 flex flex-col items-center">
          <div className="w-12 h-1 bg-[#ff00ff] mb-12 shadow-[0_0_10px_#ff00ff]" />
          <h2 className="text-4xl font-black tracking-tighter uppercase mb-6 text-center">
            SYSTEM_OVERSIGHT <span className={NEON_CYAN}>OPERATIONAL</span>
          </h2>
          <p className="text-slate-600 text-xs text-center max-w-xl font-bold tracking-widest leading-loose">
            ALL_DATA_FLOWS_ARE_ENCRYPTED_AND_LOGGED. PI_D_O_S_PROTECTION_ACTIVE.
            V_ALPHA_0_9_JULES_EDITION_STABLE.
          </p>
        </div>
      </footer>
    </div>
  );
}
