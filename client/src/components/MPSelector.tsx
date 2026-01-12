import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, X, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MPSelectorProps {
  value: number | null;
  onChange: (mpId: number | null) => void;
  excludeId?: number | null;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function MPSelector({
  value,
  onChange,
  excludeId,
  placeholder = "Ieškoti Seimo nario...",
  label,
  className,
}: MPSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: searchResults, isLoading } = trpc.search.global.useQuery(
    { query: searchQuery, limit: 10 },
    { enabled: searchQuery.length >= 2 && isOpen }
  );

  const { data: selectedMp } = trpc.mps.byId.useQuery(
    { id: value! },
    { enabled: !!value }
  );

  // Filter out excluded MP from results
  const filteredMps = searchResults?.mps.filter(mp => mp.id !== excludeId) || [];

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {label && (
        <label className="block text-sm text-[#92adc9] mb-2 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div
        onClick={() => setIsOpen(true)}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 rounded-lg",
          "bg-[#233648] border border-surface-border",
          "cursor-pointer hover:border-primary/50 transition-colors"
        )}
      >
        {selectedMp ? (
          <>
            <Avatar className="w-8 h-8">
              <AvatarImage src={selectedMp.photoUrl || undefined} />
              <AvatarFallback>{selectedMp.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{selectedMp.name}</p>
              <p className="text-[#92adc9] text-xs truncate">{selectedMp.party}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="text-[#92adc9] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <Search className="w-4 h-4 text-[#92adc9]" />
            <span className="text-[#92adc9] text-sm">{placeholder}</span>
          </>
        )}
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "absolute top-full left-0 right-0 mt-2 z-50",
            "bg-[#1b2a38] backdrop-blur-md border border-white/10 rounded-lg shadow-xl",
            "max-h-96 overflow-y-auto"
          )}
        >
          <div className="p-2">
            <div className="px-3 py-2 mb-2">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ieškoti..."
                className="w-full px-3 py-2 bg-[#233648] border border-surface-border rounded-lg text-white placeholder:text-[#92adc9] focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#92adc9] uppercase">
              <Users className="w-4 h-4" />
              Seimo nariai
            </div>
            {isLoading && (
              <div className="p-4 text-center text-[#92adc9] text-sm">Kraunama...</div>
            )}
            {!isLoading && filteredMps.length === 0 && searchQuery.length >= 2 && (
              <div className="p-4 text-center text-[#92adc9] text-sm">Rezultatų nerasta</div>
            )}
            {!isLoading && searchQuery.length < 2 && (
              <div className="p-4 text-center text-[#92adc9] text-sm">Įveskite bent 2 simbolius paieškai</div>
            )}
            {filteredMps.map((mp) => (
              <button
                key={mp.id}
                onClick={() => {
                  onChange(mp.id);
                  setIsOpen(false);
                  setSearchQuery("");
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded transition-colors text-left hover:bg-[#233648]"
              >
                {mp.photoUrl ? (
                  <img
                    src={mp.photoUrl}
                    alt={mp.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                    <span className="text-xs font-semibold">{mp.name.charAt(0)}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{mp.name}</p>
                  <p className="text-xs text-gray-400 truncate">{mp.party}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
