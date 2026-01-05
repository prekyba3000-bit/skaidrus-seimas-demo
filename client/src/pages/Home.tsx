import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Users,
  Sun,
  XCircle,
  Activity,
  Target,
  Leaf
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { trpc } from "@/lib/trpc";
import { BalticPatternBorder } from "@/components/BalticPatternBorder";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParty, setSelectedParty] = useState<string>("all");
  const [hoveredMp, setHoveredMp] = useState<number | null>(null);

  // "Target Lock" State - Expand MP to full screen modal
  const [selectedMpId, setSelectedMpId] = useState<number | null>(null);

  const { data: mps, isLoading: mpsLoading } = trpc.mps.list.useQuery({
    isActive: true,
  });

  // Fetch details for selected MP
  const { data: selectedMpDetails } = trpc.mps.byId.useQuery(
    { id: selectedMpId! },
    { enabled: !!selectedMpId }
  );

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

  const handleOpenMp = (id: number) => {
    setSelectedMpId(id);
  };

  const closeMp = () => {
    setSelectedMpId(null);
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-serif overflow-x-hidden relative">
      <div className="grain-overlay" />
      <div className="fixed inset-0 baltic-pattern-bg pointer-events-none" />

      {/* --- HEADER --- */}
      <section className={`transition-all duration-700 ${selectedMpId ? 'opacity-0 -translate-y-20 pointer-events-none' : 'opacity-100'}`}>
        <div className="container px-6 pt-32 pb-12">
          <div className="flex flex-col items-center justify-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex justify-center mb-4">
                <Sun className="h-16 w-16 text-[var(--amber-start)] animate-[spin_60s_linear_infinite]" />
              </div>
              <p className="text-[var(--amber-end)] tracking-[0.3em] text-xs uppercase font-bold mb-4">
                Skaidrumas / Atvirumas / Tiesa
              </p>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight uppercase text-[var(--foreground)]">
                Seimas<span className="text-[var(--amber-start)]">.Info</span>
              </h1>
            </motion.div>

            {/* SEARCH INPUT */}
            <div className="w-full max-w-2xl relative group">
              <Sun className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--amber-start)] group-focus-within:text-[var(--amber-end)] transition-colors" />
              <Input
                className="pl-12 h-14 bg-[var(--card)]/50 backdrop-blur-md border-[var(--amber-start)]/30 focus:border-[var(--amber-end)] focus:ring-[var(--amber-end)] text-lg placeholder:text-[var(--muted-foreground)] font-sans"
                placeholder="Ieškoti seimo nario..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- FILTER TABS --- */}
      <section className={`border-y border-[var(--amber-start)]/10 bg-[var(--background)]/80 backdrop-blur-sm sticky top-20 z-40 transition-all duration-700 ${selectedMpId ? 'opacity-0 -translate-y-20 pointer-events-none' : 'opacity-100'}`}>
        <div className="container px-6 py-4 flex gap-4 overflow-x-auto no-scrollbar">
          {parties.map(party => (
            <button
              key={party}
              onClick={() => setSelectedParty(party)}
              className={`px-4 py-2 text-xs uppercase font-bold tracking-widest transition-all border rounded-full whitespace-nowrap ${selectedParty === party
                ? "bg-[var(--amber-start)] text-[var(--peat-oak)] border-[var(--amber-start)] shadow-lg shadow-[var(--amber-start)]/20"
                : "bg-transparent text-[var(--muted-foreground)] border-[var(--amber-start)]/20 hover:border-[var(--amber-start)] hover:text-[var(--foreground)]"
                }`}
            >
              {party === "all" ? "VISOS FRAKCIJOS" : party}
            </button>
          ))}
        </div>
      </section>

      {/* --- GRID --- */}
      <section className="py-12 pb-32 min-h-screen">
        <div className="container px-6 relative">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
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
                  <BalticPatternBorder key={i}>
                    <div className="aspect-[3/4] bg-[var(--muted)]/20 animate-pulse" />
                  </BalticPatternBorder>
                ))
              ) : filteredMps.map((mp) => (
                <motion.div
                  key={mp.id}
                  layoutId={`mp-card-${mp.id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => handleOpenMp(mp.id)}
                  onMouseEnter={() => setHoveredMp(mp.id)}
                  onMouseLeave={() => setHoveredMp(null)}
                  className="cursor-pointer h-full"
                >
                  <BalticPatternBorder variant="simple" className="h-full group hover:shadow-2xl hover:shadow-[var(--amber-start)]/20 transition-all duration-500">
                    <div className="amber-inclusion-card h-full relative overflow-hidden">
                      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[var(--amber-start)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      {/* Photo */}
                      <div className="aspect-[3/4] w-full overflow-hidden relative">
                        <img
                          src={mp.photoUrl || ""}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0 sepia-[0.3]"
                          alt={mp.name}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--peat-oak)] via-transparent to-transparent opacity-80" />
                      </div>

                      {/* Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                        <h3 className="text-lg font-bold text-[var(--linen-white)] leading-tight mb-1 group-hover:text-[var(--amber-start)] transition-colors">
                          {mp.name}
                        </h3>
                        <p className="text-[10px] text-[var(--amber-start)]/80 uppercase tracking-widest font-bold">
                          {mp.party}
                        </p>
                      </div>
                    </div>
                  </BalticPatternBorder>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* EXPANDED VIEW (MODAL) */}
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
                  className="absolute inset-0 bg-[var(--peat-oak)]/90 backdrop-blur-sm"
                  onClick={closeMp}
                />

                {/* Modal Content */}
                <motion.div
                  className="relative w-full max-w-5xl min-h-[80vh] bg-[var(--background)] rounded-lg shadow-2xl flex flex-col lg:flex-row overflow-hidden border border-[var(--amber-start)]/30"
                  initial={{ scale: 0.9, y: 50 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 50 }}
                >
                  <BalticPatternBorder variant="sun" className="absolute inset-0 pointer-events-none z-50 rounded-lg opacity-50" />

                  {/* Close Button */}
                  <button
                    onClick={closeMp}
                    className="absolute top-6 right-6 z-[60] p-2 hover:bg-[var(--amber-start)]/20 text-[var(--muted-foreground)] hover:text-[var(--peat-oak)] rounded-full transition-all"
                  >
                    <XCircle className="w-8 h-8" />
                  </button>

                  {/* Left: Visuals */}
                  <div className="lg:w-1/3 relative bg-[var(--peat-oak)] p-8 flex flex-col items-center justify-center text-center">
                    <div className="absolute inset-0 bg-[url('/amber-texture.png')] opacity-20 mix-blend-overlay" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[var(--amber-start)]/10 to-[var(--peat-oak)]" />

                    <div className="relative z-10">
                      <div className="w-64 h-64 mx-auto mb-6 relative">
                        <div className="absolute inset-0 rounded-full border-2 border-[var(--amber-start)]/30 animate-[spin_20s_linear_infinite]" />
                        <Avatar className="w-full h-full border-4 border-[var(--amber-start)] shadow-[0_0_50px_var(--amber-start)]/30">
                          <AvatarImage src={filteredMps.find(m => m.id === selectedMpId)?.photoUrl || ""} className="object-cover" />
                          <AvatarFallback>MP</AvatarFallback>
                        </Avatar>
                      </div>

                      <h2 className="text-3xl font-extrabold text-[var(--linen-white)] uppercase tracking-tight mb-2">
                        {filteredMps.find(m => m.id === selectedMpId)?.name}
                      </h2>
                      <div className="inline-block px-4 py-1 border border-[var(--amber-start)]/50 rounded-full">
                        <span className="text-[var(--amber-start)] text-xs font-bold uppercase tracking-widest">
                          {filteredMps.find(m => m.id === selectedMpId)?.party}
                        </span>
                      </div>

                      <div className="mt-8 flex justify-center">
                        <Link href={`/mp/${selectedMpId}`}>
                          <button className="px-8 py-3 bg-[var(--amber-end)] text-[var(--linen-white)] font-bold uppercase tracking-widest hover:bg-[var(--amber-start)] hover:text-[var(--peat-oak)] transition-all shadow-lg">
                            Atidaryti Profilį
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Stats */}
                  <div className="lg:w-2/3 p-8 lg:p-12 bg-[var(--background)]">
                    <h3 className="text-2xl font-bold uppercase tracking-widest mb-8 text-[var(--foreground)] border-b border-[var(--amber-start)]/20 pb-4">
                      Atskaitomybės Duomenys
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                      <div className="p-6 bg-[var(--card)]/50 border border-[var(--amber-start)]/20 rounded-lg">
                        <p className="text-[var(--muted-foreground)] text-xs uppercase font-bold tracking-widest mb-2">Reitingas</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-6xl font-extrabold text-[var(--amber-end)]">
                            {filteredMps.find(m => m.id === selectedMpId)?.score || 0}%
                          </span>
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] mt-2 italic">Apskaičiuota pagal lankomumą ir aktyvumą</p>
                      </div>

                      <div className="p-6 bg-[var(--card)]/50 border border-[var(--amber-start)]/20 rounded-lg">
                        <p className="text-[var(--muted-foreground)] text-xs uppercase font-bold tracking-widest mb-2">Teisės aktai</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-6xl font-extrabold text-[var(--copper-moss)]">12</span>
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] mt-2 italic">Pateikti projektai šioje sesijoje</p>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold uppercase tracking-widest mb-6 text-[var(--foreground)] flex items-center gap-2">
                      <Users className="h-5 w-5 text-[var(--amber-start)]" /> Komanda
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedMpDetails?.assistants?.length ? selectedMpDetails.assistants.slice(0, 6).map(ast => (
                        <div key={ast.id} className="flex items-center gap-3 p-3 bg-[var(--card)]/30 border-l-2 border-[var(--amber-start)]/30 hover:bg-[var(--card)] transition-colors">
                          <Leaf className="h-4 w-4 text-[var(--copper-moss)]" />
                          <div>
                            <p className="text-sm font-bold text-[var(--foreground)]">{ast.name}</p>
                            <p className="text-[10px] uppercase text-[var(--muted-foreground)]">{ast.role || "Padėjėjas"}</p>
                          </div>
                        </div>
                      )) : (
                        <div className="text-[var(--muted-foreground)] italic">Komandos narių nerasta.</div>
                      )}
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
