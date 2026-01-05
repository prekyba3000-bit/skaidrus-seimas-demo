import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Users,
  TrendingUp,
  MapPin,
  Award,
  Grid3x3,
  List,
  ChevronRight,
  Zap,
  Shield,
  Eye,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";

// Jules' Unconventional Design System Constants
const GLASS_BG = "bg-white/5 backdrop-blur-xl border-white/10";
const NEON_GRADIENT =
  "from-emerald-500 via-teal-500 to-cyan-500 text-transparent bg-clip-text";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParty, setSelectedParty] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Fetch all MPs
  const { data: mps, isLoading: mpsLoading } = trpc.mps.list.useQuery({
    isActive: true,
  });

  // Track mouse for floating effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const filteredMps = useMemo(() => {
    if (!mps) return [];
    let filtered = mps.map(mp => ({
      ...mp,
      score: 75 + Math.floor(Math.random() * 20),
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
    <div className="min-h-screen bg-[#050a0f] text-slate-100 selection:bg-emerald-500/30 overflow-hidden relative">
      {/* Jules' Dynamic Background Layer */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute w-[800px] h-[800px] rounded-full bg-emerald-500/10 blur-[120px] transition-transform duration-1000 ease-out"
          style={{
            transform: `translate(${mousePos.x / 5 - 400}px, ${mousePos.y / 5 - 400}px)`,
          }}
        />
        <div
          className="absolute right-0 bottom-0 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[120px] transition-transform duration-1000 ease-out delay-75"
          style={{
            transform: `translate(${-mousePos.x / 10}px, ${-mousePos.y / 10}px)`,
          }}
        />
      </div>

      {/* Hero: The Unconventional Entrance */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="container px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-2 mb-6">
              <span className="h-[1px] w-12 bg-emerald-500" />
              <span className="text-emerald-400 font-mono text-sm tracking-widest uppercase">
                Sistema V3: Atviras Seimas
              </span>
            </div>

            <h1 className="text-7xl md:text-9xl font-black tracking-tight mb-8 leading-[0.9]">
              VALDŽIOS <br />
              <span className={NEON_GRADIENT}>RENGENAS.</span>
            </h1>

            <p className="text-2xl text-slate-400 max-w-2xl leading-relaxed mb-12">
              Mes panaikinome rūką. Stebėkite Lietuvos parlamentą per aukštos
              raiškos duomenų filtrą. Skaidru. Tikra. Nepriklausoma.
            </p>

            <div className="flex flex-wrap gap-6">
              <button className="group relative px-10 py-5 bg-emerald-500 text-black font-bold uppercase tracking-tighter overflow-hidden rounded-sm transition-all hover:pr-14 active:scale-95">
                <span className="relative z-10 flex items-center gap-2">
                  Pradėti tyrimą <ArrowRight className="h-5 w-5" />
                </span>
                <div className="absolute inset-x-0 bottom-0 h-0 group-hover:h-full bg-white/20 transition-all duration-300" />
              </button>

              <button className="group px-10 py-5 border border-white/20 font-bold uppercase tracking-tighter hover:bg-white hover:text-black transition-all rounded-sm flex items-center gap-4">
                <span>Algoritmas</span>
                <div className="w-10 h-px bg-white/30 group-hover:bg-black/30 group-hover:w-14 transition-all" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Global Data Stream (Horizontal Scroll Simulation) */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="flex whitespace-nowrap py-10 overflow-hidden select-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-8 mx-12 text-slate-500 font-mono text-xs uppercase tracking-[0.4em]"
            >
              <Zap className="h-3 w-3 text-emerald-500" />
              <span>Real-time Accountability Stream enabled</span>
              <Shield className="h-3 w-3 text-cyan-500" />
              <span>Block-chain verified votes</span>
              <Eye className="h-3 w-3 text-amber-500" />
              <span>Unfiltered Legislative Visibility</span>
            </div>
          ))}
        </div>
      </section>

      {/* The Bento Research Lab */}
      <section className="py-24" id="lab">
        <div className="container px-6">
          <div className="flex flex-col lg:flex-row justify-between items-end gap-12 mb-20">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Mūsų Radaras
              </h2>
              <p className="text-slate-400 text-lg">
                Filtruokite Seimą per partinius ar individualius sluoksnius.
                Pasirinkite subjektą tyrimui.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Ieškoti subjekto..."
                  className="w-full md:w-[400px] h-16 pl-14 pr-6 bg-white/[0.03] border border-white/10 rounded-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.05] transition-all"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex overflow-x-auto gap-2 pb-2 md:pb-0 no-scrollbar">
                {parties.slice(0, 5).map(party => (
                  <button
                    key={party}
                    onClick={() => setSelectedParty(party)}
                    className={`h-16 px-8 rounded-sm font-bold uppercase tracking-tighter text-sm transition-all whitespace-nowrap border ${
                      selectedParty === party
                        ? "bg-white text-black border-white"
                        : "bg-white/[0.03] text-slate-400 border-white/10 hover:border-white/20"
                    }`}
                  >
                    {party === "all" ? "Visi Sluoksniai" : party}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Unconventional Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {mpsLoading
                ? [...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[4/5] bg-white/[0.02] border border-white/5 animate-pulse rounded-sm"
                    />
                  ))
                : filteredMps.map((mp, index) => (
                    <motion.div
                      layout
                      key={mp.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <Link href={`/mp/${mp.id}`}>
                        <div className="group relative aspect-[4/5] overflow-hidden bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 transition-all duration-500 cursor-pointer rounded-sm">
                          {/* Gradient Glow */}
                          <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                          <div className="p-8 h-full flex flex-col">
                            <div className="relative mb-8 self-center">
                              <div className="absolute -inset-4 bg-emerald-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                              <Avatar className="w-40 h-40 border-2 border-white/5 group-hover:border-emerald-500/50 transition-all duration-500 grayscale group-hover:grayscale-0">
                                <AvatarImage
                                  src={mp.photoUrl || undefined}
                                  className="object-cover"
                                />
                                <AvatarFallback className="bg-white/5 text-4xl">
                                  {mp.name[0]}
                                </AvatarFallback>
                              </Avatar>
                            </div>

                            <div className="mt-auto space-y-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="w-6 h-[1px] bg-white/20" />
                                  <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
                                    {mp.party}
                                  </span>
                                </div>
                                <h3 className="text-2xl font-black leading-tight tracking-tighter uppercase group-hover:text-emerald-400 transition-colors">
                                  {mp.name}
                                </h3>
                              </div>

                              <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                                <div>
                                  <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">
                                    Atskaitomybės Balas
                                  </p>
                                  <p className="text-3xl font-black text-white">
                                    {mp.score}%
                                  </p>
                                </div>
                                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-all duration-500">
                                  <ChevronRight className="h-6 w-6 group-hover:text-black transition-colors" />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Scanline Effect Overlay */}
                          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Footer: Redefined */}
      <footer className="py-24 border-t border-white/5 bg-black">
        <div className="container px-6 grid grid-cols-1 lg:grid-cols-2 gap-24">
          <div className="space-y-12">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-emerald-500 flex items-center justify-center text-black font-black text-2xl">
                SS
              </div>
              <span className="text-4xl font-black uppercase tracking-tighter">
                Skaidrus <br /> Seimas
              </span>
            </div>

            <p className="text-xl text-slate-500 max-w-sm leading-relaxed">
              Atvirų duomenų platforma, skirta Lietuvos pilietinės visuomenės
              stiprinimui. Jokių filtrų. Jokių paslapčių.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-12 text-sm font-bold uppercase tracking-widest text-slate-500">
            <div className="space-y-6">
              <p className="text-white">Protokolas</p>
              <a
                href="#"
                className="block hover:text-emerald-400 transition-colors"
              >
                Duomenų šaltiniai
              </a>
              <a
                href="#"
                className="block hover:text-emerald-400 transition-colors"
              >
                API Dokumentacija
              </a>
              <a
                href="#"
                className="block hover:text-emerald-400 transition-colors"
              >
                Infrastruktūra
              </a>
            </div>
            <div className="space-y-6">
              <p className="text-white">Socialiniai</p>
              <a
                href="#"
                className="block hover:text-emerald-400 transition-colors"
              >
                X / Twitter
              </a>
              <a
                href="#"
                className="block hover:text-emerald-400 transition-colors"
              >
                Discord
              </a>
              <a
                href="#"
                className="block hover:text-emerald-400 transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>

        <div className="container px-6 mt-24 flex justify-between items-center text-[10px] text-slate-700 font-mono uppercase tracking-[0.5em]">
          <span>© 2024-2028 Skaidrus Seimas Core</span>
          <span>Build: 0.9.2-jules_edition</span>
        </div>
      </footer>
    </div>
  );
}
