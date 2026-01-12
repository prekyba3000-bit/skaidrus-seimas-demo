import { motion } from "framer-motion";
import { Link } from "wouter";
import { Users, FileText, Building2, Clock, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GlobalSearchResults } from "@/types/search";
import { EmptyState } from "@/components/ui/empty-state";

interface SearchDropdownProps {
    results: GlobalSearchResults | undefined;
    isLoading: boolean;
    isOpen: boolean;
    selectedIndex: number;
    recentSearches?: string[];
    onSelect: (href: string) => void;
    onSelectRecent: (query: string) => void;
    onClearRecent?: () => void;
    onClose: () => void;
    className?: string;
}

export function SearchDropdown({
    results,
    isLoading,
    isOpen,
    selectedIndex,
    recentSearches = [],
    onSelect,
    onSelectRecent,
    onClearRecent,
    onClose,
    className,
}: SearchDropdownProps) {
    if (!isOpen) return null;

    // Flatten results for keyboard navigation
    const flatResults: Array<{ type: string; id: number; title: string; subtitle?: string; href: string }> = [];

    if (results) {
        results.mps.forEach((mp) => {
            flatResults.push({
                type: "mp",
                id: mp.id,
                title: mp.name,
                subtitle: mp.party,
                href: `/mp/${mp.id}`,
            });
        });
        results.bills.forEach((bill) => {
            flatResults.push({
                type: "bill",
                id: bill.id,
                title: bill.title,
                subtitle: bill.registrationNumber || bill.status,
                href: `/bills/${bill.id}`,
            });
        });
        results.committees.forEach((committee) => {
            flatResults.push({
                type: "committee",
                id: committee.id,
                title: committee.name,
                subtitle: committee.description || undefined,
                href: `/committees/${committee.id}`,
            });
        });
    }

    const hasResults = flatResults.length > 0;
    const showRecentSearches = !isLoading && !hasResults && recentSearches.length > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
                "absolute top-full left-0 right-0 mt-2 max-h-96 overflow-y-auto rounded-lg",
                "bg-[#1b2a38] backdrop-blur-md border border-white/10 shadow-xl shadow-black/20",
                "z-50",
                className
            )}
        >
            {isLoading && (
                <div className="p-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex gap-3 mb-3 animate-pulse">
                            <div className="w-10 h-10 bg-[#233648] rounded" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-[#233648] rounded w-3/4" />
                                <div className="h-3 bg-[#233648] rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!isLoading && hasResults && (
                <div className="p-2">
                    {/* MPs Section */}
                    {results!.mps.length > 0 && (
                        <div className="mb-2">
                            <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#92adc9] uppercase tracking-wide">
                                <Users className="w-4 h-4" />
                                Seimo nariai
                            </div>
                            {results!.mps.map((mp, index) => {
                                const globalIndex = flatResults.findIndex(
                                    (r) => r.type === "mp" && r.id === mp.id
                                );
                                const isSelected = globalIndex === selectedIndex;
                                return (
                                    <Link
                                        key={`mp-${mp.id}`}
                                        href={`/mp/${mp.id}`}
                                        onClick={() => {
                                            onSelect(`/mp/${mp.id}`);
                                        }}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2 rounded transition-colors text-left",
                                            isSelected
                                                ? "bg-[#233648] text-white"
                                                : "text-gray-300 hover:bg-[#233648]"
                                        )}
                                    >
                                        {mp.photoUrl ? (
                                            <img
                                                src={mp.photoUrl}
                                                alt={mp.name}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                                                <span className="text-xs font-semibold">
                                                    {mp.name.charAt(0)}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{mp.name}</p>
                                            <p className="text-xs text-gray-400 truncate">{mp.party}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    {/* Bills Section */}
                    {results!.bills.length > 0 && (
                        <div className="mb-2">
                            <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#92adc9] uppercase tracking-wide">
                                <FileText className="w-4 h-4" />
                                Įstatymai
                            </div>
                            {results!.bills.map((bill) => {
                                const globalIndex = flatResults.findIndex(
                                    (r) => r.type === "bill" && r.id === bill.id
                                );
                                const isSelected = globalIndex === selectedIndex;
                                return (
                                    <Link
                                        key={`bill-${bill.id}`}
                                        href={`/bills/${bill.id}`}
                                        onClick={() => {
                                            onSelect(`/bills/${bill.id}`);
                                        }}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2 rounded transition-colors text-left",
                                            isSelected
                                                ? "bg-[#233648] text-white"
                                                : "text-gray-300 hover:bg-[#233648]"
                                        )}
                                    >
                                        <div className="w-8 h-8 rounded bg-amber-500/20 flex items-center justify-center">
                                            <FileText className="w-4 h-4 text-amber-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{bill.title}</p>
                                            <p className="text-xs text-gray-400 truncate">
                                                {bill.registrationNumber || bill.status}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    {/* Committees Section */}
                    {results!.committees.length > 0 && (
                        <div className="mb-2">
                            <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#92adc9] uppercase tracking-wide">
                                <Building2 className="w-4 h-4" />
                                Komitetai
                            </div>
                            {results!.committees.map((committee) => {
                                const globalIndex = flatResults.findIndex(
                                    (r) => r.type === "committee" && r.id === committee.id
                                );
                                const isSelected = globalIndex === selectedIndex;
                                return (
                                    <Link
                                        key={`committee-${committee.id}`}
                                        href={`/committees/${committee.id}`}
                                        onClick={() => {
                                            onSelect(`/committees/${committee.id}`);
                                        }}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2 rounded transition-colors text-left",
                                            isSelected
                                                ? "bg-[#233648] text-white"
                                                : "text-gray-300 hover:bg-[#233648]"
                                        )}
                                    >
                                        <div className="w-8 h-8 rounded bg-emerald-500/20 flex items-center justify-center">
                                            <Building2 className="w-4 h-4 text-emerald-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{committee.name}</p>
                                            {committee.description && (
                                                <p className="text-xs text-gray-400 truncate line-clamp-1">
                                                    {committee.description}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Recent Searches */}
            {showRecentSearches && (
                <div className="p-2">
                    <div className="flex items-center justify-between px-3 py-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#92adc9] uppercase tracking-wide">
                            <Clock className="w-4 h-4" />
                            Paskutinės paieškos
                        </div>
                        {onClearRecent && (
                            <button
                                onClick={onClearRecent}
                                className="text-xs text-gray-400 hover:text-white transition-colors"
                            >
                                Išvalyti
                            </button>
                        )}
                    </div>
                    {recentSearches.map((query, index) => (
                        <button
                            key={index}
                            onClick={() => onSelectRecent(query)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded transition-colors text-left text-gray-300 hover:bg-[#233648]"
                        >
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{query}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !hasResults && !showRecentSearches && (
                <div className="p-4">
                    <EmptyState
                        icon={Search}
                        title="Rezultatų nerasta"
                        description="Pabandykite kitą paieškos užklausą arba peržiūrėkite paskutines paieškas."
                    />
                </div>
            )}
        </motion.div>
    );
}
