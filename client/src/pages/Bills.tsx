import { useState } from "react";
import { Link } from "wouter";
import {
  Search,
  Filter,
  Calendar,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";

const statusConfig = {
  proposed: {
    label: "Pateiktas",
    icon: Clock,
    color: "bg-primary/10 text-primary border-primary/20",
  },
  voted: {
    label: "Balsuota",
    icon: AlertCircle,
    color: "bg-surface-border text-[#92adc9] border-surface-border",
  },
  passed: {
    label: "Priimtas",
    icon: CheckCircle2,
    color: "bg-accent-green/10 text-accent-green border-accent-green/20",
  },
  rejected: {
    label: "Atmestas",
    icon: XCircle,
    color: "bg-red-500/10 text-red-500 border-red-500/20",
  },
};

export default function Bills() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Visi");

  const { data: bills, isLoading } = trpc.bills.list.useQuery({
    category: selectedCategory !== "Visi" ? selectedCategory : undefined,
  });

  const filteredBills =
    bills?.filter(
      bill =>
        bill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const formatDate = (date: Date | string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("lt-LT");
  };

  return (
    <DashboardLayout title="Įstatymų Projektai">
      <div className="flex flex-col gap-2">
        <h1 className="text-white text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em]">
          Teisėkūros Procesas
        </h1>
        <p className="text-[#92adc9] text-base font-normal leading-normal">
          Sekite ir analizuokite Seime svarstomus įstatymų projektus.
        </p>
      </div>

      <div className="sticky top-0 z-40 bg-background pt-2 pb-4 px-1 -mx-1 flex flex-col gap-4">
        <div className="flex w-full items-stretch rounded-xl shadow-sm">
          <div className="flex-1 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#92adc9]" />
            <Input
              className="w-full pl-14 pr-5 h-14 bg-surface-dark border-surface-border text-white placeholder:text-[#92adc9] rounded-xl focus-visible:ring-primary transition-all text-base"
              placeholder="Ieškokite projektų pagal pavadinimą ar turinį..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
        {isLoading
          ? Array.from({ length: 9 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-48 rounded-xl border border-surface-border"
              />
            ))
          : filteredBills.map(bill => {
              const config =
                statusConfig[bill.status as keyof typeof statusConfig] ||
                statusConfig.proposed;
              return (
                <Link key={bill.id} href={`/bills/${bill.id}`}>
                  <div className="group bg-surface-dark border border-surface-border rounded-xl p-6 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase font-bold tracking-widest border-surface-border text-[#92adc9]"
                      >
                        {bill.category}
                      </Badge>
                      <Badge
                        className={`font-black text-[9px] uppercase tracking-widest border-2 ${config.color}`}
                      >
                        {config.label}
                      </Badge>
                    </div>

                    <h3 className="text-white text-lg font-black group-hover:text-primary transition-colors leading-tight mb-2 line-clamp-2">
                      {bill.title}
                    </h3>

                    <div className="flex items-center gap-2 text-[#92adc9] text-[10px] uppercase font-bold tracking-widest mb-4">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(bill.submittedAt)}
                    </div>

                    <p className="text-[#92adc9] text-sm line-clamp-3 mb-6 flex-1">
                      {bill.description || "Aprašymas nepateiktas"}
                    </p>

                    <div className="flex justify-between items-center py-2 border-t border-surface-border mt-auto">
                      <span className="text-primary text-[10px] font-black uppercase tracking-widest">
                        Skaityti daugiau
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#92adc9] group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </Link>
              );
            })}
      </div>
    </DashboardLayout>
  );
}
