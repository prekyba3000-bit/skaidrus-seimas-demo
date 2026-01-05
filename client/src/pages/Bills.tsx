import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Calendar,
  FileText,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Leaf
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { BalticPatternBorder } from "@/components/BalticPatternBorder";

const statusConfig = {
  proposed: {
    label: "Pateiktas",
    icon: Clock,
    color: "text-[var(--foreground)] border-[var(--amber-start)]/50 bg-[var(--amber-start)]/10",
  },
  voted: {
    label: "Balsuota",
    icon: AlertCircle,
    color:
      "text-[var(--amber-end)] border-[var(--amber-end)]/50 bg-[var(--amber-end)]/10",
  },
  passed: {
    label: "Priimtas",
    icon: CheckCircle2,
    color: "text-[var(--copper-moss)] border-[var(--copper-moss)]/50 bg-[var(--copper-moss)]/10",
  },
  rejected: {
    label: "Atmestas",
    icon: XCircle,
    color: "text-[var(--destructive)] border-[var(--destructive)]/50 bg-[var(--destructive)]/10",
  },
};

const categories = [
  "Visi",
  "Švietimas",
  "Sveikata",
  "Ekonomika",
  "Aplinka",
  "Socialinė apsauga",
  "Teisingumo",
];

export default function Bills() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Visi");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Fetch bills with filters
  const { data: bills, isLoading } = trpc.bills.list.useQuery({
    category: selectedCategory !== "Visi" ? selectedCategory : undefined,
    status: selectedStatus !== "all" ? selectedStatus : undefined,
  });

  // Filter bills by search term
  const filteredBills =
    bills?.filter(
      bill =>
        bill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  // Group bills by status
  const billsByStatus = {
    all: filteredBills,
    proposed: filteredBills.filter(b => b.status === "proposed"),
    voted: filteredBills.filter(b => b.status === "voted"),
    passed: filteredBills.filter(b => b.status === "passed"),
    rejected: filteredBills.filter(b => b.status === "rejected"),
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("lt-LT", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-serif relative">
      <div className="grain-overlay" />
      <div className="fixed inset-0 baltic-pattern-bg pointer-events-none" />

      {/* Header */}
      <div className="border-b border-[var(--amber-end)]/20 bg-[var(--background)]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight mb-2 uppercase font-serif">
                Įstatymų Projektai
              </h1>
              <p className="text-[var(--muted-foreground)] font-serif italic">
                Naršykite ir sekite Seimo svarstomą įstatymų leidybą
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="hover:bg-[var(--amber-start)] hover:text-white border-[var(--amber-start)]/30">
                <TrendingUp className="h-4 w-4 mr-2" />
                Populiariausi
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)] group-focus-within:text-[var(--amber-start)] transition-colors" />
              <Input
                placeholder="Ieškoti įstatymų projektų..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 border-[var(--amber-start)]/30 focus:border-[var(--amber-end)] focus:ring-[var(--amber-end)] bg-[var(--background)]/50 backdrop-blur-sm"
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full md:w-[200px] border-[var(--amber-start)]/30">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8 relative z-10">
        <Tabs
          value={selectedStatus}
          onValueChange={setSelectedStatus}
          className="space-y-6"
        >
          <TabsList className="bg-[var(--card)]/50 border border-[var(--amber-start)]/20 p-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-[var(--amber-start)]/20 data-[state=active]:text-[var(--amber-end)] uppercase tracking-wider text-xs font-bold">
              Visi ({billsByStatus.all.length})
            </TabsTrigger>
            <TabsTrigger value="proposed" className="data-[state=active]:bg-[var(--amber-start)]/20 data-[state=active]:text-[var(--amber-end)] uppercase tracking-wider text-xs font-bold">
              Pateikti ({billsByStatus.proposed.length})
            </TabsTrigger>
            <TabsTrigger value="voted" className="data-[state=active]:bg-[var(--amber-start)]/20 data-[state=active]:text-[var(--amber-end)] uppercase tracking-wider text-xs font-bold">
              Balsuoti ({billsByStatus.voted.length})
            </TabsTrigger>
            <TabsTrigger value="passed" className="data-[state=active]:bg-[var(--amber-start)]/20 data-[state=active]:text-[var(--amber-end)] uppercase tracking-wider text-xs font-bold">
              Priimti ({billsByStatus.passed.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="data-[state=active]:bg-[var(--amber-start)]/20 data-[state=active]:text-[var(--amber-end)] uppercase tracking-wider text-xs font-bold">
              Atmesti ({billsByStatus.rejected.length})
            </TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <BalticPatternBorder key={i} className="animate-pulse bg-[var(--muted)]/20 h-48">
                  <div className="h-full w-full" />
                </BalticPatternBorder>
              ))}
            </div>
          ) : (
            <TabsContent value={selectedStatus} className="mt-0">
              <AnimatePresence>
                {filteredBills.length === 0 ? (
                  <BalticPatternBorder>
                    <div className="flex flex-col items-center justify-center py-12 bg-[var(--card)]/80">
                      <FileText className="h-12 w-12 text-[var(--muted-foreground)] mb-4" />
                      <p className="text-lg font-medium mb-2 font-serif">
                        Įstatymų projektų nerasta
                      </p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Pabandykite pakeisti filtrus arba paieškos kriterijus
                      </p>
                    </div>
                  </BalticPatternBorder>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredBills.map(bill => {
                      const StatusIcon =
                        statusConfig[bill.status as keyof typeof statusConfig]
                          ?.icon || FileText;
                      const statusStyle =
                        statusConfig[bill.status as keyof typeof statusConfig]
                          ?.color || "";
                      const statusLabel =
                        statusConfig[bill.status as keyof typeof statusConfig]
                          ?.label || bill.status;

                      return (
                        <Link key={bill.id} href={`/bills/${bill.id}`}>
                          <div className="h-full group hover:-translate-y-1 transition-transform duration-300">
                            <BalticPatternBorder variant="simple" className="h-full">
                              <div className="amber-inclusion-card h-full p-6 flex flex-col relative overflow-hidden group-hover:shadow-lg transition-shadow">
                                {/* Amber Glow on Hover */}
                                <div className="absolute -inset-1 bg-gradient-to-br from-[var(--amber-start)]/20 to-transparent blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-700" />
                                
                                <div className="relative z-10 flex-1">
                                  <div className="flex items-start justify-between gap-2 mb-4">
                                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-[var(--amber-start)]/30 text-[var(--muted-foreground)]">
                                      {bill.category}
                                    </Badge>
                                    <Badge className={`${statusStyle} text-[10px] uppercase font-bold tracking-wider border`}>
                                      <StatusIcon className="h-3 w-3 mr-1" />
                                      {statusLabel}
                                    </Badge>
                                  </div>
                                  
                                  <h3 className="text-xl font-bold font-serif mb-4 text-[var(--foreground)] group-hover:text-[var(--amber-start)] transition-colors line-clamp-2 leading-tight">
                                    {bill.title}
                                  </h3>
                                  
                                  <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] mb-4 font-serif italic">
                                    <Calendar className="h-3 w-3" />
                                    <span>Pateikta: {formatDate(bill.submittedAt)}</span>
                                  </div>

                                  <p className="text-sm text-[var(--foreground)]/80 line-clamp-3 leading-relaxed">
                                    {bill.description || "Aprašymas nepateiktas"}
                                  </p>
                                </div>
                                
                                <div className="mt-6 pt-4 border-t border-[var(--amber-start)]/10 flex justify-between items-center relative z-10">
                                  <span className="text-[10px] text-[var(--amber-end)] font-bold uppercase tracking-widest">
                                    Skaityti Plačiau
                                  </span>
                                  <Leaf className="h-4 w-4 text-[var(--copper-moss)] opacity-50 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            </BalticPatternBorder>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </AnimatePresence>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
