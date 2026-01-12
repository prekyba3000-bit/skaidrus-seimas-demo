import { useState, useEffect } from "react";

/**
 * Hook to manage recent searches in localStorage
 * Stores up to 5 most recent search queries
 */

const STORAGE_KEY = "skaidrus-seimas-recent-searches";
const MAX_RECENT = 5;

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load recent searches:", error);
    }
  }, []);

  // Add a search query to recent searches
  const addSearch = (query: string) => {
    if (!query || query.trim().length === 0) return;

    const trimmed = query.trim();

    // Remove existing instance and add to front, limit to MAX_RECENT
    const updated = [
      trimmed,
      ...recentSearches.filter(s => s !== trimmed),
    ].slice(0, MAX_RECENT);

    setRecentSearches(updated);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to save recent searches:", error);
    }
  };

  // Clear all recent searches
  const clearSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear recent searches:", error);
    }
  };

  return {
    recentSearches,
    addSearch,
    clearSearches,
  };
}
