import { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  Search,
  Filter,
  Users,
  TrendingUp,
  MapPin,
  Award,
  ChevronDown,
  Grid3x3,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
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
    if (!score) return "text-gray-400";
    const numScore = parseFloat(score);
    if (numScore >= 85) return "text-green-600 dark:text-green-400";
    if (numScore >= 70) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                Seimo Nariai
              </h1>
              <p className="text-muted-foreground">
                Susipažinkite su Lietuvos Respublikos Seimo nariais
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Viso Seimo narių
                    </p>
                    <p className="text-3xl font-bold">{stats.totalMps}</p>
                  </div>
                  <Users className="h-10 w-10 text-primary opacity-20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Frakcijų</p>
                    <p className="text-3xl font-bold">{stats.partiesCount}</p>
                  </div>
                  <Filter className="h-10 w-10 text-primary opacity-20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Vidutinis įvertinimas
                    </p>
                    <p className="text-3xl font-bold">{stats.avgScore}</p>
                  </div>
                  <Award className="h-10 w-10 text-primary opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Ieškoti pagal vardą ar partiją..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedParty} onValueChange={setSelectedParty}>
                <SelectTrigger className="w-full md:w-[200px]">
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
                <SelectTrigger className="w-full md:w-[200px]">
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
                <SelectTrigger className="w-full md:w-[180px]">
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

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Rodoma: {filteredMps.length} iš {stats.totalMps}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        {mpsLoading ? (
          <div
            className={`grid gap-6 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
          >
            {[...Array(12)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : filteredMps.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Seimo narių nerasta</p>
              <p className="text-sm text-muted-foreground">
                Pabandykite pakeisti filtrus arba paieškos kriterijus
              </p>
            </CardContent>
          </Card>
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
                  <Card className="h-full hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer group">
                    <CardHeader>
                      <div
                        className={`flex ${viewMode === "grid" ? "flex-col items-center text-center" : "flex-row items-start"} gap-4`}
                      >
                        <Avatar
                          className={
                            viewMode === "grid" ? "w-20 h-20" : "w-16 h-16"
                          }
                        >
                          <AvatarImage src={mp.photoUrl ?? undefined} />
                          <AvatarFallback className="text-lg">
                            {mp.name
                              .split(" ")
                              .map(n => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg group-hover:text-primary transition-colors mb-2">
                            {mp.name}
                          </CardTitle>
                          <Badge variant="outline" className="mb-2 text-xs">
                            {mp.party}
                          </Badge>
                          {mp.district && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {mp.district}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Accountability Score */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">
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
                            className="h-2"
                            indicatorClassName={
                              score && parseFloat(score) >= 85
                                ? "bg-green-600"
                                : score && parseFloat(score) >= 70
                                  ? "bg-yellow-600"
                                  : "bg-red-600"
                            }
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {scoreLabel}
                          </p>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-muted/50 rounded p-2">
                            <p className="text-muted-foreground">Dalyvavimas</p>
                            <p className="font-semibold">
                              {mp.stats?.votingAttendance
                                ? `${parseFloat(mp.stats.votingAttendance).toFixed(0)}%`
                                : "—"}
                            </p>
                          </div>
                          <div className="bg-muted/50 rounded p-2">
                            <p className="text-muted-foreground">Projektai</p>
                            <p className="font-semibold">
                              {mp.stats?.billsProposed || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
