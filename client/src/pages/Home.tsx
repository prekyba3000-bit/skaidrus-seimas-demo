import { useState, useMemo } from "react";
import { 
  Search, 
  MapPin, 
  Mail, 
  Phone, 
  ChevronRight,
  Filter
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DashboardLayout from "@/components/DashboardLayout";
import { Link } from "wouter";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParty, setSelectedParty] = useState("Visi");

  const { data: mps, isLoading } = trpc.mps.list.useQuery({ isActive: true });

  const parties = useMemo(() => {
    if (!mps || !Array.isArray(mps)) return ["Visi"];
    const uniqueParties = new Set(mps.map(mp => mp.party));
    return ["Visi", ...Array.from(uniqueParties).sort()];
  }, [mps]);

  const filteredMps = useMemo(() => {
    if (!mps || !Array.isArray(mps)) return [];
    return mps.filter(mp => {
      const matchesSearch = mp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           mp.party.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (mp.district && mp.district.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesParty = selectedParty === "Visi" || mp.party === selectedParty;
      return matchesSearch && matchesParty;
    });
  }, [mps, searchTerm, selectedParty]);

  return (
    <DashboardLayout title="Seimo Narių Katalogas">
      {/* Page Heading & Intro */}
      <div className="flex flex-col gap-2">
        <h1 className="text-white text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em]">
          Parlamento Narių Sąrašas
        </h1>
        <p className="text-[#92adc9] text-base font-normal leading-normal">
          Sekite visų {mps?.length || 141} Seimo narių veiklą ir profilių informaciją realiu laiku.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="sticky top-0 z-40 bg-background pt-2 pb-4 px-1 -mx-1 transition-all">
        <div className="flex flex-col gap-4">
          {/* Search Input */}
          <div className="flex w-full items-stretch rounded-xl shadow-sm">
            <div className="flex-1 relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#92adc9]" />
              <Input 
                className="w-full pl-14 pr-5 h-14 bg-surface-dark border-surface-border text-white placeholder:text-[#92adc9] rounded-xl focus-visible:ring-primary focus-visible:border-primary transition-all text-base"
                placeholder="Ieškokite pagal vardą, apygardą arba partiją..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex gap-2 min-h-10 overflow-x-auto pb-2 sm:pb-0 custom-scrollbar">
              {parties.slice(0, 5).map(party => (
                <Button
                  key={party}
                  variant={selectedParty === party ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setSelectedParty(party)}
                  className={`rounded-full px-4 h-9 font-bold text-sm transition-all whitespace-nowrap ${
                    selectedParty === party 
                      ? "bg-white text-slate-900 border-none" 
                      : "bg-[#233648] text-[#92adc9] hover:text-white"
                  }`}
                >
                  {party === "Visi" && <span className="mr-2">Sąrašas:</span>}
                  {party}
                </Button>
              ))}
              <Button variant="ghost" size="sm" className="text-[#92adc9] hover:text-white h-9">
                <Filter className="w-4 h-4 mr-2" />
                Daugiau
              </Button>
            </div>
            <p className="text-[#92adc9] text-sm font-medium whitespace-nowrap">
              Rodoma {filteredMps.length} iš {mps?.length || 0} narių
            </p>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
        {isLoading ? (
          Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-64 bg-surface-dark rounded-xl animate-pulse border border-surface-border" />
          ))
        ) : (
          filteredMps.map((mp) => (
            <Link key={mp.id} href={`/mp/${mp.id}`}>
              <div className="group flex flex-col bg-surface-dark rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-surface-border cursor-pointer">
                {/* Card Header Strip */}
                <div className="relative h-24 bg-gradient-to-r from-blue-600 to-blue-400">
                  <div className="absolute -bottom-10 left-4 p-1 bg-surface-dark rounded-full">
                    <Avatar className="h-20 w-20 border-4 border-surface-dark">
                      <AvatarImage src={mp.photoUrl || ""} alt={mp.name} />
                      <AvatarFallback>{mp.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                {/* Card Content */}
                <div className="pt-12 pb-5 px-5 flex flex-col gap-4 flex-1">
                  <div>
                    <h3 className="text-white text-lg font-bold group-hover:text-primary transition-colors leading-tight">
                      {mp.name}
                    </h3>
                    <p className="text-[#92adc9] text-xs font-bold uppercase tracking-wider mt-1">
                      {mp.party}
                    </p>
                  </div>

                  <div className="space-y-2 mt-auto">
                    <div className="flex items-center gap-2 text-[#92adc9] text-xs">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span className="truncate">{mp.district || "Daugiamandatė"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#92adc9] text-xs">
                      <Mail className="w-3.5 h-3.5 text-primary" />
                      <span className="truncate">{mp.email}</span>
                    </div>
                  </div>

                  <Button 
                    variant="secondary" 
                    className="w-full mt-2 bg-[#233648] hover:bg-primary hover:text-white transition-all text-xs font-bold rounded-lg border-none"
                  >
                    Peržiūrėti Profilį
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
