import React from "react";
import { Search } from "lucide-react";

const UniversalSearch = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
      <input
        type="text"
        placeholder="Search for an MP..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="w-full h-16 pl-16 pr-6 bg-white/[0.05] border-2 border-white/10 rounded-full focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] backdrop-blur-md transition-all text-lg"
      />
    </div>
  );
};

export default UniversalSearch;
