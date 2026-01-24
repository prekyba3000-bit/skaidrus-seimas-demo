import React from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Activity,
  Users,
  Map as MapIcon,
  Menu,
  Search,
  Bell,
  MessageSquare,
  ArrowLeftRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUIStore } from "@/store/ui";
import { useDebounce } from "@/hooks/useDebounce";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import { SearchDropdown } from "@/components/SearchDropdown";
import { trpc } from "@/lib/trpc";
import { useState, useRef, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function DashboardLayout({
  children,
  title,
}: DashboardLayoutProps) {
  const [location, navigate] = useLocation();
  const { isSidebarOpen, toggleSidebar, searchQuery, setSearchQuery } =
    useUIStore();

  // Search state
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { recentSearches, addSearch, clearSearches } = useRecentSearches();

  // Debounce search query (300ms delay for optimized suggestions)
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Optimized search suggestions query (uses getSuggestions endpoint)
  const { data: searchResults, isLoading } =
    trpc.search.getSuggestions.useQuery(
      { query: debouncedSearch },
      {
        enabled: debouncedSearch.length >= 1, // Suggestions work with 1+ character
        onSuccess: () => {
          setIsDropdownOpen(debouncedSearch.length >= 1);
        },
      }
    );

  // Calculate total results for keyboard navigation (includes committees)
  const totalResults = searchResults
    ? searchResults.mps.length +
      searchResults.bills.length +
      (searchResults.committees?.length || 0)
    : 0;

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, totalResults - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && searchResults) {
          navigateToResult(selectedIndex);
        }
        break;
      case "Escape":
        setIsDropdownOpen(false);
        searchInputRef.current?.blur();
        break;
    }
  };

  // Navigate to selected result
  const navigateToResult = (index: number) => {
    if (!searchResults) return;

    let currentIndex = 0;

    // Check MPs
    if (index < searchResults.mps.length) {
      const mp = searchResults.mps[index];
      navigate(`/mp/${mp.id}`);
      addSearch(searchQuery);
      setIsDropdownOpen(false);
      setSearchQuery("");
      return;
    }
    currentIndex += searchResults.mps.length;

    // Check Bills
    if (index < currentIndex + searchResults.bills.length) {
      const bill = searchResults.bills[index - currentIndex];
      navigate(`/bills/${bill.id}`);
      addSearch(searchQuery);
      setIsDropdownOpen(false);
      setSearchQuery("");
      return;
    }
    // Check Committees
    currentIndex += searchResults.bills.length;
    if (
      searchResults.committees &&
      index < currentIndex + searchResults.committees.length
    ) {
      const committee = searchResults.committees[index - currentIndex];
      navigate(`/committees/${committee.id}`);
      addSearch(searchQuery);
      setIsDropdownOpen(false);
      setSearchQuery("");
      return;
    }
  };

  // Handle dropdown close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
      {/* Mobile overlay: tap to close drawer */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden relative lg:ml-72 bg-noble-gradient">
        <header className="flex items-center justify-between border-b border-surface-border bg-surface-dark px-3 sm:px-4 md:px-6 py-3 flex-shrink-0 z-10">
          <div className="flex items-center gap-4 sm:gap-6 md:gap-8 w-full max-w-2xl">
            <button
              className="lg:hidden text-white p-2 -ml-2 rounded-lg hover:bg-emerald-900/30 transition-colors touch-manipulation"
              aria-label="Atidaryti meniu"
              title="Meniu"
              onClick={toggleSidebar}
            >
              {isSidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            <h2 className="text-white text-base sm:text-lg font-bold leading-tight tracking-[-0.015em] hidden sm:block">
              {title}
            </h2>
            <div className="flex flex-col flex-1 max-w-full sm:max-w-[400px] relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-emerald-400/50 group-focus-within:text-primary transition-colors" />
              </div>
              <Input
                ref={searchInputRef}
                className="block w-full pl-10 pr-3 py-2.5 border-none rounded-xl leading-5 bg-emerald-900/30 text-emerald-100 placeholder:text-emerald-400/50 focus:outline-none focus:bg-emerald-900/50 focus:ring-1 focus:ring-primary/50 text-sm transition-all duration-200"
                placeholder="Search bills, deputies, or keywords..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (debouncedSearch.length >= 2) {
                    setIsDropdownOpen(true);
                  }
                }}
              />
              {/* Search Dropdown */}
              <SearchDropdown
                query={searchQuery}
                isOpen={isDropdownOpen}
                selectedIndex={selectedIndex}
                recentSearches={recentSearches}
                onSelectRecent={query => {
                  setSearchQuery(query);
                  searchInputRef.current?.focus();
                }}
                onClearRecent={clearSearches}
                onClose={() => setIsDropdownOpen(false)}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 bg-[#233648] hover:bg-[#324d67] text-white"
                aria-label="Pranešimai"
                title="Pranešimai"
              >
                <Bell className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 bg-[#233648] hover:bg-[#324d67] text-white"
                aria-label="Žinutės"
                title="Žinutės"
              >
                <MessageSquare className="w-5 h-5" />
              </Button>
            </div>
            <Avatar className="h-10 w-10 border-2 border-[#233648] cursor-pointer">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=politician" />
              <AvatarFallback>MP</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6 lg:p-8 pb-20 lg:pb-8 bg-background custom-scrollbar">
          <div className="mx-auto max-w-[1200px] w-full flex flex-col gap-4 md:gap-6">
            {children}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
