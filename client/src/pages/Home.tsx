import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronRight,
  Zap,
  Shield,
  Eye,
  ArrowRight,
  Mail,
  Phone,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { trpc } from "@/lib/trpc";
import UniversalSearch from "@/components/UniversalSearch";
import OrbitView from "@/components/OrbitView";

// Jules' Unconventional Design System Constants
const GLASS_BG = "bg-white/5 backdrop-blur-xl border-white/10";
const NEON_GRADIENT =
  "from-emerald-500 via-teal-500 to-cyan-500 text-transparent bg-clip-text";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selectedMp, setSelectedMp] = useState<any>(null);

  // Fetch all MPs with their assistants
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
    if (!searchTerm) return mps;
    return mps.filter(
      mp =>
        mp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mp.party.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [mps, searchTerm]);

  return (
    <div className="min-h-screen bg-[#050a0f] text-slate-100 selection:bg-emerald-500/30 overflow-hidden relative">
      {/* Jules' Dynamic Background Layer */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute w-[800px] h-[800px] rounded-full bg-emerald-500/10 blur-[120px] transition-transform duration-1000 ease-out"
          style={{
            transform: `translate(${mousePos.x / 5 - 400}px, ${
              mousePos.y / 5 - 400
            }px)`,
          }}
        />
        <div
          className="absolute right-0 bottom-0 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[120px] transition-transform duration-1000 ease-out delay-75"
          style={{
            transform: `translate(${-mousePos.x / 10}px, ${
              -mousePos.y / 10
            }px)`,
          }}
        />
      </div>

      {/* Main content area */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className="w-full max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4">
              Seimo Asistentų
              <br />
              <span className={NEON_GRADIENT}>ORBITA</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Interaktyvus Lietuvos parlamentarų ir jų komandų žemėlapis.
              Atraskite, kas padeda priimti sprendimus.
            </p>
          </div>

          <UniversalSearch
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </motion.div>

        <div className="w-full flex-grow relative mt-12">
          <OrbitView
            mps={filteredMps}
            isLoading={mpsLoading}
            onMpSelect={setSelectedMp}
          />
        </div>
      </main>

      {/* MP Detail/Assistant View */}
      <AnimatePresence>
        {selectedMp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 50 }}
            transition={{ duration: 0.4, ease: "circOut" }}
            className={`fixed bottom-0 left-0 right-0 p-6 z-20 ${GLASS_BG} border-t-2 border-white/10`}
            style={{
              boxShadow: "0 -10px 40px rgba(0,0,0,0.3)",
            }}
          >
            <div className="container mx-auto">
              <button
                onClick={() => setSelectedMp(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              >
                &times;
              </button>
              <div className="flex items-center gap-6 mb-4">
                <Avatar className="w-24 h-24 border-2 border-emerald-500/50">
                  <AvatarImage
                    src={selectedMp.photoUrl || undefined}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-white/5 text-4xl">
                    {selectedMp.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-3xl font-bold">{selectedMp.name}</h2>
                  <p className="text-lg text-emerald-400">{selectedMp.party}</p>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-bold mb-2 uppercase tracking-widest text-slate-400">
                  Asistentai ({selectedMp.assistants.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-48 overflow-y-auto">
                  {selectedMp.assistants.map((assistant: any) => (
                    <div
                      key={assistant.id}
                      className={`p-4 rounded-lg ${GLASS_BG}`}
                    >
                      <p className="font-bold text-white">{assistant.name}</p>
                      <p className="text-sm text-slate-400">{assistant.role}</p>
                      <div className="flex gap-4 mt-2">
                        {assistant.email && (
                          <a
                            href={`mailto:${assistant.email}`}
                            className="text-slate-400 hover:text-emerald-400"
                          >
                            <Mail size={16} />
                          </a>
                        )}
                        {assistant.phone && (
                          <a
                            href={`tel:${assistant.phone}`}
                            className="text-slate-400 hover:text-emerald-400"
                          >
                            <Phone size={16} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="fixed bottom-4 right-4 text-xs text-slate-600 font-mono z-0">
        Build: 1.0.0-zero-gravity
      </footer>
    </div>
  );
}
