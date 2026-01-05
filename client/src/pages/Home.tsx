import { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "wouter";
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
  Maximize2,
  Minimize2,
  XCircle,
  Activity
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { trpc } from "@/lib/trpc";
import { SatelliteNode } from "@/components/SatelliteNode";

// --- HUD Components ---

function TerminalLog({ logs }: { logs: string[] }) {
  return (
    <div className="hidden lg:block fixed left-6 bottom-24 w-64 h-48 font-mono text-[10px] text-[#00ffff]/70 overflow-hidden pointer-events-none z-10">
      <div className="absolute inset-0 bg-black/80 blur-sm -z-10" />
      <div className="flex flex-col-reverse h-full">
        {logs.map((log, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1 - (i * 0.15), x: 0 }}
            className="mb-1"
          >
            <span className="text-[#ff00ff] mr-2">{`>`}</span>
            {log}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function GridBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none opacity-20 hex-grid-bg -z-50" />
  );
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParty, setSelectedParty] = useState<string>("all");
  const [isTerminalFocused, setIsTerminalFocused] = useState(false);
  const [hoveredMp, setHoveredMp] = useState<number | null>(null);

  // "Target Lock" State - Expand MP to full screen
  const [selectedMpId, setSelectedMpId] = useState<number | null>(null);

  // Fake system logs
  const [logs, setLogs] = useState<string[]>(["SYSTEM_INIT...", "CONNECTING_TO_SEIMAS_DB...", "ENCRYPTION_KEY_VERIFIED."]);

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 8));
  };

  const { data: mps, isLoading: mpsLoading } = trpc.mps.list.useQuery({
    isActive: true,
  });

  // Fetch details for selected MP to show "Mission Objectives"
  const { data: selectedMpDetails } = trpc.mps.byId.useQuery(
    { id: selectedMpId! },
    { enabled: !!selectedMpId }
  );

  const filteredMps = useMemo(() => {
    if (!mps) return [];
    let filtered = mps.map(mp => ({
      ...mp,
      score: 75 + Math.floor(Math.random() * 20),
      // Mock assistant count if not in list payload
      assistantCount: (mp as any).assistantCount || Math.floor(Math.random() * 5),
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

  // Handle Target Lock
  const handleTargetLock = (id: number) => {
    addLog(`TARGET_LOCKED: NODE_ID_${id}`);
    addLog(`FETCHING_DOSSIER...`);
    setSelectedMpId(id);
  };

  const clearTargetLock = () => {
    addLog(`TARGET_DISENGAGED.`);
    addLog(`RETURNING_TO_GRID...`);
    setSelectedMpId(null);
  }

  return (
    <div className="min-h-screen bg-[var(--cyber-black)] text-slate-100 font-mono overflow-x-hidden relative">
      <GridBackground />
      <div className="fixed inset-0 pointer-events-none scanline-overlay z-[100] opacity-30" />
      <TerminalLog logs={logs} />

      {/* --- HEADER / SEARCH HUD --- */}
      <section className={`transition-all duration-700 ${selectedMpId ? 'opacity-0 -translate-y-20 pointer-events-none' : 'opacity-100'}`}>
        <div className="container px-6 pt-32 pb-12">
          <div className="flex flex-col items-center justify-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <p className="text-[#ff00ff] tracking-[0.5em] text-[10px] uppercase font-black mb-4 animate-pulse">
                Alpha Protocol / Level 4 Access
              </p>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic">
                INTEL<span className="text-[#00ffff]">.STREAM</span>
              </h1>
            </motion.div>

            {/* TERMINAL INPUT */}
            <div
              className={`w-full max-w-2xl relative transition-all duration-300 ${isTerminalFocused ? "scale-[1.02]" : ""}`}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-[#00ffff] to-[#ff00ff] rounded opacity-20 blur group-focus-within:opacity-40" />
              <div className="relative bg-black border border-white/10 rounded overflow-hidden flex items-center p-4">
                <span className="text-[#ccff00] mr-4 font-black select-none">
                  root@skaidrus_seimas:~$
                </span>
                <input
                  type="text"
                  className="bg-transparent border-none outline-none flex-1 text-[#00ffff] terminal-cursor placeholder:text-slate-700"
                  placeholder="SEARCH_DB..."
                  onFocus={() => setIsTerminalFocused(true)}
                  onBlur={() => setIsTerminalFocused(false)}
                  value={searchTerm}
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    if (Math.random() > 0.7) addLog("QUERY_UPDATE: " + e.target.value);
                  }}
                />
                <Activity className="h-4 w-4 text-[#00ffff] animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FILTER FRAGMENTS --- */}
      <section className={`border-y border-white/5 bg-black/20 backdrop-blur-sm sticky top-24 z-40 transition-all duration-700 ${selectedMpId ? 'opacity-0 -translate-y-20 pointer-events-none' : 'opacity-100'}`}>
        <div className="container px-6 py-4 flex gap-4 overflow-x-auto no-scrollbar">
          {parties.map(party => (
            <button
              key={party}
              onClick={() => {
                setSelectedParty(party);
                addLog(`FILTER_APPLIED: ${party.toUpperCase()}`);
              }}
              className={`px-4 py-1 text-[10px] uppercase font-black tracking-widest transition-all border whitespace-nowrap ${selectedParty === party
                  ? "bg-[#00ffff] text-black border-[#00ffff] shadow-[0_0_15px_#00ffff]"
                  : "bg-transparent text-slate-500 border-white/10 hover:border-[#00ffff]/30 hover:text-white"
                }`}
            >
              {party === "all" ? "[ ALL_UNITS ]" : `[ ${party.slice(0, 15)} ]`}
            </button>
          ))}
        </div>
      </section>

      {/* --- MAIN INTELLIGENCE GRID --- */}
      <section className="py-12 pb-32 min-h-screen">
        <div className="container px-6 relative">

          {/* GRID VIEW */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            animate={{
              opacity: selectedMpId ? 0 : 1,
              scale: selectedMpId ? 0.9 : 1,
              filter: selectedMpId ? "blur(10px)" : "blur(0px)"
            }}
            transition={{ duration: 0.5 }}
            style={{ pointerEvents: selectedMpId ? "none" : "auto" }}
          >
            <AnimatePresence mode="popLayout">
              {mpsLoading ? (
                [...Array(10)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-white/5 animate-pulse rounded-sm" />
                ))
              ) : filteredMps.map((mp) => (
                <motion.div
                  layoutId={`mp-card-${mp.id}`}
                  key={mp.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => handleTargetLock(mp.id)}
                  onMouseEnter={() => {
                    setHoveredMp(mp.id);
                    if (Math.random() > 0.9) addLog(`HOVER: ${mp.seimasId}`); // Less sparse logging
                  }}
                  onMouseLeave={() => setHoveredMp(null)}
                  className="group relative cursor-pointer"
                >
                  <div className="relative aspect-[3/4] bg-[#050505] border border-white/10 group-hover:border-[#00ffff]/50 transition-all duration-300 overflow-hidden">
                    {/* Hover Effect: Radar */}
                    {hoveredMp === mp.id && (
                      <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#00ffff] to-transparent" />
                    )}

                    {/* Image */}
                    <img
                      src={mp.photoUrl || ""}
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500 grayscale group-hover:grayscale-0"
                      alt={mp.name}
                    />

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center gap-2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                        <span className="w-1.5 h-1.5 bg-[#00ffff] rounded-full animate-pulse" />
                        <span className="text-[8px] text-[#00ffff] tracking-widest font-bold">READY</span>
                      </div>
                      <h3 className="text-sm font-bold text-white uppercase leading-tight group-hover:text-[#00ffff] transition-colors">
                        {mp.name}
                      </h3>
                      <p className="text-[9px] text-slate-400 uppercase tracking-wider mt-1 truncate">
                        {mp.party}
                      </p>
                    </div>

                    {/* Top Decoration */}
                    <div className="absolute top-2 right-2 opacity-50">
                      <Target className="w-3 h-3 text-[#ff00ff]" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* EXPANDED "TARGET LOCK" VIEW (Overlay) */}
          <AnimatePresence>
            {selectedMpId && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-12 overflow-y-auto"
              >
                {/* Backdrop */}
                <div
                  className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                  onClick={clearTargetLock}
                />

                {/* Dossier Card */}
                <motion.div
                  className="relative w-full max-w-6xl min-h-[80vh] bg-[#020406] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col lg:flex-row overflow-hidden"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                >
                  {/* Close Button */}
                  <button
                    onClick={clearTargetLock}
                    className="absolute top-6 right-6 z-50 p-2 bg-black/50 hover:bg-[#ff00ff] text-white rounded-full border border-white/20 hover:border-[#ff00ff] transition-all group"
                  >
                    <XCircle className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                  </button>

                  {/* Left: Visuals & Satellites */}
                  <div className="lg:w-1/3 relative bg-[#050505] p-8 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-white/10">
                    <div className="absolute inset-0 grid-bg opacity-20" />

                    {/* Profile Orbit Container */}
                    <div className="relative w-64 h-64 flex items-center justify-center mb-8">
                      {/* Rotating Rings */}
                      <div className="absolute inset-0 border border-[#00ffff]/20 rounded-full animate-spin [animation-duration:10s]" />
                      <div className="absolute inset-4 border border-[#ff00ff]/20 rounded-full animate-spin [animation-duration:15s] [animation-direction:reverse]" />

                      <Avatar className="w-48 h-48 border-2 border-[#00ffff]/50 shadow-[0_0_30px_#00ffff]">
                        <AvatarImage src={filteredMps.find(m => m.id === selectedMpId)?.photoUrl || ""} className="object-cover" />
                        <AvatarFallback className="text-4xl font-black bg-black text-[#00ffff]">MP</AvatarFallback>
                      </Avatar>

                      {/* Satellite Nodes (Assistants) */}
                      {selectedMpDetails?.assistants?.map((ast, i) => (
                        <SatelliteNode
                          key={ast.id}
                          index={i}
                          total={selectedMpDetails.assistants.length}
                          radius={140}
                        />
                      ))}
                    </div>

                    <div className="text-center relative z-10 space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ffff]/10 border border-[#00ffff]/30 text-[#00ffff] text-[10px] font-black tracking-widest uppercase">
                        <span className="w-1.5 h-1.5 bg-[#00ffff] rounded-full animate-pulse" />
                        Target_Online
                      </div>
                      <h2 className="text-3xl font-black uppercase tracking-tight text-white/90">
                        {filteredMps.find(m => m.id === selectedMpId)?.name}
                      </h2>
                      <p className="text-[#ff00ff] font-bold tracking-widest text-xs uppercase">
                        {filteredMps.find(m => m.id === selectedMpId)?.party}
                      </p>
                    </div>
                  </div>

                  {/* Right: Data HUD */}
                  <div className="lg:w-2/3 p-8 lg:p-12 overflow-y-auto">
                    <div className="flex items-center gap-4 mb-8">
                      <Cpu className="text-[#00ffff]" />
                      <h3 className="text-xl font-black text-white uppercase tracking-widest">Mission_Objectives</h3>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 bg-white/[0.02] border border-white/5 hover:border-[#ff00ff]/30 transition-colors group">
                        <h4 className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-bold group-hover:text-[#ff00ff]">Accountability Score</h4>
                        <div className="text-5xl font-black text-white mb-2">{filteredMps.find(m => m.id === selectedMpId)?.score || 0}%</div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-[#ff00ff] w-[75%]" />
                        </div>
                      </div>

                      <div className="p-6 bg-white/[0.02] border border-white/5 hover:border-[#00ffff]/30 transition-colors group">
                        <h4 className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-bold group-hover:text-[#00ffff]">Bills Proposed</h4>
                        <div className="text-5xl font-black text-white mb-2">12</div>
                        <p className="text-xs text-slate-500">Legislative initiatives this term.</p>
                      </div>
                    </div>

                    <div className="mt-8">
                      <div className="flex items-center gap-4 mb-6">
                        <Users className="text-[#00ffff]" />
                        <h3 className="text-xl font-black text-white uppercase tracking-widest">Support_Network</h3>
                        <div className="h-px flex-1 bg-white/10" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {selectedMpDetails?.assistants?.length ? selectedMpDetails.assistants.map(ast => (
                          <div key={ast.id} className="flex items-center gap-4 p-3 border border-white/5 bg-white/[0.01] hover:bg-[#00ffff]/5 transition-colors">
                            <div className="w-8 h-8 rounded bg-[#00ffff]/20 flex items-center justify-center text-[#00ffff] font-bold text-xs">
                              {ast.name[0]}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-200">{ast.name}</p>
                              <p className="text-[10px] text-slate-500 uppercase">{ast.role || "Specialist"}</p>
                            </div>
                          </div>
                        )) : (
                          <p className="text-slate-600 text-xs italic">No support network detected.</p>
                        )}
                      </div>
                    </div>
                  </div>

                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
