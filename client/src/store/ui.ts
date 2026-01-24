import { create } from "zustand";

interface UIState {
  isSidebarOpen: boolean;
  searchQuery: string;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  setSearchQuery: (query: string) => void;
}

export const useUIStore = create<UIState>(set => ({
  isSidebarOpen: false, // Closed on mobile first load; lg:translate-x-0 keeps sidebar visible on desktop
  searchQuery: "",
  toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  setSearchQuery: (query: string) => set({ searchQuery: query }),
}));
