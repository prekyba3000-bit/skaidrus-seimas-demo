import { useState } from "react";
import { Link } from "wouter";
import { Search, Users2, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";

export default function Committees() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: committees, isLoading } = trpc.committees.list.useQuery();

  const filteredCommittees =
    committees?.filter(
      c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.description?.toLowerCase() ?? "").includes(searchTerm.toLowerCase())
    ) ?? [];

  return (
    <DashboardLayout title="Komitetai">
      <div className="flex flex-col gap-2">
        <h1 className="text-white text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em]">
          Seimo Komitetai
        </h1>
        <p className="text-[#92adc9] text-base font-normal leading-normal">
          Naršykite komitetus ir jų narius.
        </p>
      </div>

      <div className="sticky top-0 z-40 bg-background pt-2 pb-4 px-1 -mx-1 flex flex-col gap-4">
        <div className="flex w-full items-stretch rounded-xl shadow-sm">
          <div className="flex-1 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#92adc9]" />
            <Input
              id="committee-search"
              name="committee-search"
              autoComplete="off"
              className="w-full pl-14 pr-5 h-14 bg-surface-dark border-surface-border text-white placeholder:text-[#92adc9] rounded-xl focus-visible:ring-primary transition-all text-base"
              placeholder="Ieškokite komitetų pagal pavadinimą ar aprašymą..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-40 rounded-xl border border-surface-border"
              />
            ))
          : filteredCommittees.length === 0
            ? (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                  <Users2 className="w-16 h-16 text-[#92adc9]/50 mb-4" />
                  <p className="text-[#92adc9] text-lg font-medium">
                    Komitetų nerasta
                  </p>
                  <p className="text-[#92adc9]/70 text-sm mt-1">
                    Pabandykite kitą paieškos užklausą arba sinchronizuokite
                    duomenis.
                  </p>
                </div>
              )
            : filteredCommittees.map(committee => (
                <Link
                  key={committee.id}
                  href={`/committees/${committee.id}`}
                  className="group block"
                >
                  <div className="h-full rounded-xl border border-surface-border bg-surface-dark p-6 hover:border-primary/40 hover:bg-emerald-900/10 transition-all duration-200 flex flex-col">
                    <div className="flex items-start gap-4">
                      <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                        <Users2 className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold text-lg truncate group-hover:text-primary transition-colors">
                          {committee.name}
                        </h3>
                        {committee.description && (
                          <p className="text-[#92adc9] text-sm mt-1 line-clamp-2">
                            {committee.description}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#92adc9] group-hover:text-primary shrink-0 transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
      </div>
    </DashboardLayout>
  );
}
