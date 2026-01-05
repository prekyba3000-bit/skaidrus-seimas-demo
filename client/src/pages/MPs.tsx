import { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  Sun,
  Filter,
  Users,
  TrendingUp,
  MapPin,
  Award,
  ChevronDown,
  Grid3x3,
  List,
  Leaf
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { BalticPatternBorder } from "@/components/BalticPatternBorder";

type ViewMode = "grid" | "list";
type SortOption = "name" | "party" | "score" | "district";

export default function MPs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParty, setSelectedParty] = useState<string>("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Fetch all MPs
  const { data: mps, isLoading: mpsLoading } = trpc.mps.list.useQuery({
    isActive: true,
  });

  // Fetch all MP stats
  const statsQueries = trpc.useQueries(t =>
    (mps || []).map(mp => t.mps.stats({ mpId: mp.id }))
  );

  // Combine MPs with their stats
  const mpsWithStats = useMemo(() => {
    if (!mps) return [];
    return mps.map((mp, index) => ({
      ...mp,
      stats: statsQueries[index]?.data,
    }));
  }, [mps, statsQueries]);

  // Get unique parties and districts
  const parties = useMemo(() => {
    const uniqueParties = new Set(mps?.map(mp => mp.party) || []);
    return ["all", ...Array.from(uniqueParties).sort()];
  }, [mps]);

  const districts = useMemo(() => {
    const uniqueDistricts = new Set(
      mps?.map(mp => mp.district).filter(Boolean) || []
    );
    return ["all", ...Array.from(uniqueDistricts).sort()];
  }, [mps]);

  // Filter and sort MPs
  const filteredMps = useMemo(() => {
    let filtered = mpsWithStats;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        mp =>
          mp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mp.party.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Party filter
    if (selectedParty !== "all") {
      filtered = filtered.filter(mp => mp.party === selectedParty);
    }

    // District filter
    if (selectedDistrict !== "all") {
      filtered = filtered.filter(mp => mp.district === selectedDistrict);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name, "lt");
        case "party":
          return a.party.localeCompare(b.party, "lt");
        case "score":
          const scoreA = parseFloat(a.stats?.accountabilityScore || "0");
          const scoreB = parseFloat(b.stats?.accountabilityScore || "0");
          return scoreB - scoreA;
        case "district":
          return (a.district || "").localeCompare(b.district || "", "lt");
        default:
          return 0;
      }
    });

    return filtered;
  }, [mpsWithStats, searchTerm, selectedParty, selectedDistrict, sortBy]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalMps = mps?.length || 0;
    const partiesCount = new Set(mps?.map(mp => mp.party)).size;
    const avgScore =
      mpsWithStats.reduce(
        (sum, mp) => sum + parseFloat(mp.stats?.accountabilityScore || "0"),
        0
      ) / (mpsWithStats.length || 1);

    return {
      totalMps,
      partiesCount,
      avgScore: avgScore.toFixed(1),
    };
  }, [mps, mpsWithStats]);

  const getScoreColor = (score: string | undefined) => {
    if (!score) return "text-[var(--muted-foreground)]";
    const numScore = parseFloat(score);
    if (numScore >= 85) return "text-[var(--copper-moss)]";
    if (numScore >= 70) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: string | undefined) => {
    if (!score) return "N/A";
    const numScore = parseFloat(score);
    if (numScore >= 90) return "Puiku";
    if (numScore >= 80) return "Gerai";
    if (numScore >= 70) return "Vidutiniškai";
    return "Silpnai";
  };

  return (
    <div className="min-h-screen bg-[var(--background)] relative">
      {/* Background Grain and Pattern */}
      <div className="grain-overlay" />
      <div className="fixed inset-0 baltic-pattern-bg pointer-events-none" />

      {/* Header */}
      <div className="border-b border-[var(--amber-end)]/20 bg-[var(--background)]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="container py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-[var(--foreground)] uppercase font-serif">
                Lietuvos Seimas
              </h1>
              <p className="text-[var(--muted-foreground)] font-serif italic">
                Tautos atstovybė | 2024-2028
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="hover:bg-[var(--amber-start)] hover:text-white"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="hover:bg-[var(--amber-start)] hover:text-white"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <BalticPatternBorder variant="simple" className="h-full">
              <div className="p-6 bg-[var(--card)]/90 h-full flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--muted-foreground)] uppercase tracking-wider">
                    Seimo nariai
                  </p>
                  <p className="text-3xl font-bold text-[var(--primary)]">{stats.totalMps}</p>
                </div>
                <Users className="h-10 w-10 text-[var(--amber-start)] opacity-50" />
              </div>
            </BalticPatternBorder>

            <BalticPatternBorder variant="simple" className="h-full">
              <div className="p-6 bg-[var(--card)]/90 h-full flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--muted-foreground)] uppercase tracking-wider">Frakcijos</p>
                  <p className="text-3xl font-bold text-[var(--primary)]">{stats.partiesCount}</p>
                </div>
                <Filter className="h-10 w-10 text-[var(--amber-start)] opacity-50" />
              </div>
            </BalticPatternBorder>

            <BalticPatternBorder variant="simple" className="h-full">
              <div className="p-6 bg-[var(--card)]/90 h-full flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--muted-foreground)] uppercase tracking-wider">
                    Vidutinis reitingas
                  </p>
                  <p className="text-3xl font-bold text-[var(--primary)]">{stats.avgScore}</p>
                </div>
                <Award className="h-10 w-10 text-[var(--amber-start)] opacity-50" />
              </div>
            </BalticPatternBorder>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 group">
                {/* Saulutė Icon */}
                <Sun className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--amber-start)] transition-all duration-300 group-focus-within:text-[var(--amber-end)] group-focus-within:rotate-90" />
                <Input
                  placeholder="Ieškoti pagal vardą ar partiją..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 border-[var(--amber-start)]/30 focus:border-[var(--amber-end)] focus:ring-[var(--amber-end)] bg-[var(--background)]/50 backdrop-blur-sm"
                />
              </div>
              <Select value={selectedParty} onValueChange={setSelectedParty}>
                <SelectTrigger className="w-full md:w-[200px] border-[var(--amber-start)]/30">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Partija" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Visos partijos</SelectItem>
                  {parties.slice(1).map(party => (
                    <SelectItem key={party} value={party}>
                      {party}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedDistrict}
                onValueChange={setSelectedDistrict}
              >
                <SelectTrigger className="w-full md:w-[200px] border-[var(--amber-start)]/30">
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Apygarda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Visos apygardos</SelectItem>
                  {districts.slice(1).map(district => (
                    <SelectItem key={district} value={district || ""}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={sortBy}
                onValueChange={v => setSortBy(v as SortOption)}
              >
                <SelectTrigger className="w-full md:w-[180px] border-[var(--amber-start)]/30">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Pagal vardą</SelectItem>
                  <SelectItem value="party">Pagal partiją</SelectItem>
                  <SelectItem value="score">Pagal įvertinimą</SelectItem>
                  <SelectItem value="district">Pagal apygardą</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between text-sm text-[var(--muted-foreground)]">
              <span>
                Rodoma: {filteredMps.length} iš {stats.totalMps}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8 relative z-10">
        {mpsLoading ? (
          <div
            className={`grid gap-6 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
          >
            {[...Array(12)].map((_, i) => (
              <BalticPatternBorder key={i} className="h-64 animate-pulse bg-[var(--muted)]/20">
                <div className="h-full w-full" />
              </BalticPatternBorder>
            ))}
          </div>
        ) : filteredMps.length === 0 ? (
          <BalticPatternBorder>
            <div className="flex flex-col items-center justify-center py-12 bg-[var(--card)]/80">
              <Users className="h-12 w-12 text-[var(--muted-foreground)] mb-4" />
              <p className="text-lg font-medium mb-2">Seimo narių nerasta</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                Pabandykite pakeisti filtrus arba paieškos kriterijus
              </p>
            </div>
          </BalticPatternBorder>
        ) : (
          <div
            className={`grid gap-6 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
          >
            {filteredMps.map(mp => {
              const score = mp.stats?.accountabilityScore;
              const scoreColor = getScoreColor(score);
              const scoreLabel = getScoreLabel(score);

              return (
                <Link key={mp.id} href={`/mp/${mp.id}`}>
                  {/* 'Amber Inclusion' Card Wrapper */}
                  <div className="group h-full transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[var(--amber-start)]/20">
                    <BalticPatternBorder variant="simple" className="h-full">
                      <div className="amber-inclusion-card h-full flex flex-col p-4">
                        <div className={`flex ${viewMode === "grid" ? "flex-col items-center text-center" : "flex-row items-start"} gap-4 mb-4`}>
                          <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-[var(--amber-start)] blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                            <Avatar
                              className={
                                viewMode === "grid" ? "w-24 h-24 border-2 border-[var(--amber-start)]/50" : "w-16 h-16 border border-[var(--amber-start)]/50"
                              }
                            >
                              <AvatarImage src={mp.photoUrl ?? undefined} className="object-cover" />
                              <AvatarFallback className="text-lg bg-[var(--peat-oak)] text-[var(--amber-start)]">
                                {mp.name
                                  .split(" ")
                                  .map(n => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                          </div>

                          <div className="flex-1 min-w-0 z-10">
                            <h3 className="text-lg font-bold text-[var(--foreground)] group-hover:text-[var(--amber-start)] transition-colors mb-1">
                              {mp.name}
                            </h3>
                            <Badge variant="outline" className="mb-2 text-xs border-[var(--amber-start)]/30 text-[var(--muted-foreground)]">
                              {mp.party}
                            </Badge>
                            {mp.district && (
                              <div className="flex items-center justify-center gap-1 text-xs text-[var(--muted-foreground)]">
                                <MapPin className="h-3 w-3" />
                                {mp.district}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-auto space-y-3 relative z-10 w-full">
                          {/* Decorative Divider */}
                          <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--amber-start)]/30 to-transparent" />

                          {/* Accountability Score */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">
                                Atskaitomybė
                              </span>
                              <span className={`text-sm font-bold ${scoreColor}`}>
                                {score
                                  ? `${parseFloat(score).toFixed(0)}%`
                                  : "N/A"}
                              </span>
                            </div>
                            <Progress
                              value={score ? parseFloat(score) : 0}
                              className="h-1.5 bg-[var(--muted)]"
                              indicatorClassName={
                                score && parseFloat(score) >= 85
                                  ? "bg-[var(--copper-moss)]"
                                  : score && parseFloat(score) >= 70
                                    ? "bg-amber-600"
                                    : "bg-red-600"
                              }
                            />
                          </div>

                          {/* Quick Stats */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-[var(--background)]/40 rounded p-2 text-center border border-[var(--amber-start)]/10">
                              <p className="text-[var(--muted-foreground)] mb-1">Lankomumas</p>
                              <p className="font-semibold text-[var(--foreground)]">
                                {mp.stats?.votingAttendance
                                  ? `${parseFloat(mp.stats.votingAttendance).toFixed(0)}%`
                                  : "—"}
                              </p>
                            </div>
                            <div className="bg-[var(--background)]/40 rounded p-2 text-center border border-[var(--amber-start)]/10">
                              <p className="text-[var(--muted-foreground)] mb-1">Projektai</p>
                              <p className="font-semibold text-[var(--foreground)]">
                                {mp.stats?.billsProposed || 0}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </BalticPatternBorder>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
