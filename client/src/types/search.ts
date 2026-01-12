/**
 * TypeScript types for Global Search feature
 */

export type SearchResultType = "mp" | "bill" | "committee";

export interface MP {
  id: number;
  name: string;
  party: string;
  district?: string | null;
  photoUrl?: string | null;
}

export interface Bill {
  id: number;
  title: string;
  status: string;
  registrationNumber?: string | null;
}

export interface Committee {
  id: number;
  name: string;
  description?: string | null;
}

export interface GlobalSearchResults {
  mps: MP[];
  bills: Bill[];
  committees: Committee[];
  totalResults: number;
}

export interface SearchResult {
  type: SearchResultType;
  id: number;
  title: string;
  subtitle?: string;
  href: string;
}
