import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DashboardLayout from "@/components/DashboardLayout";

export default function Dashboard() {
  const { data: topDelegates } = trpc.mps.topDelegates.useQuery({ limit: 3 });

  return (
    <DashboardLayout title="Overview">
      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-[1600px] mx-auto pb-8">
        {/* HERO TILE: Legislative Activity (2x2 on desktop) */}
        <div className="gemstone-card rounded-2xl p-6 xl:col-span-2 xl:row-span-2 flex flex-col justify-between relative overflow-hidden group">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="flex justify-between items-start z-10">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">gavel</span>
                Legislative Activity
              </h3>
              <p className="text-emerald-400/70 text-sm mt-1">Current Session Attendance</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-900/50 border border-emerald-700/50 text-xs font-medium text-emerald-200">
              Live Updates
            </div>
          </div>

          {/* Ring Chart */}
          <div className="flex flex-col items-center justify-center my-6 relative">
            <div className="relative size-64 flex items-center justify-center">
              {/* Background Circle */}
              <svg className="transform -rotate-90 size-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" fill="none" r="42" stroke="#064e3b" strokeOpacity="0.4" strokeWidth="8"></circle>
                {/* Progress Circle (85%) */}
                <circle className="drop-shadow-[0_0_10px_rgba(245,159,10,0.4)]" cx="50" cy="50" fill="none" r="42" stroke="#f59f0a" strokeDasharray="264" strokeDashoffset="39.6" strokeLinecap="round" strokeWidth="8"></circle>
              </svg>
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-white tracking-tighter drop-shadow-md">85%</span>
                <span className="text-emerald-400 text-sm font-medium uppercase tracking-wide mt-1">Attendance</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-4 z-10">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-emerald-400">Sessions</span>
              <span className="text-white font-semibold">42</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-emerald-400">Bills Passed</span>
              <span className="text-white font-semibold">18</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-emerald-400">Bills Rejected</span>
              <span className="text-white font-semibold">5</span>
            </div>
          </div>
        </div>

        {/* STAT TILE 1: Budget Transparency */}
        <div className="gemstone-card rounded-2xl p-6 flex flex-col justify-between gap-4 hover:bg-emerald-900/40 transition-colors">
          <div className="flex items-start justify-between">
            <div className="p-2 rounded-lg bg-emerald-900/50 border border-emerald-700/30 text-emerald-300">
              <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
            </div>
            <span className="flex items-center text-emerald-400 text-xs font-medium bg-emerald-950/50 px-2 py-1 rounded-md border border-emerald-800/50">
              <span className="material-symbols-outlined text-sm mr-1">trending_up</span> +12%
            </span>
          </div>
          <div>
            <p className="text-emerald-200/70 text-sm font-medium">Total Budget Tracked</p>
            <p className="text-2xl font-bold text-white mt-1">€2,400,000</p>
            <div className="w-full bg-emerald-950 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-primary h-full rounded-full w-[75%] shadow-[0_0_10px_rgba(245,159,10,0.5)]"></div>
            </div>
          </div>
        </div>

        {/* STAT TILE 2: Lobbyist Declarations */}
        <div className="gemstone-card rounded-2xl p-6 flex flex-col justify-between gap-4 hover:bg-emerald-900/40 transition-colors">
          <div className="flex items-start justify-between">
            <div className="p-2 rounded-lg bg-emerald-900/50 border border-emerald-700/30 text-emerald-300">
              <span className="material-symbols-outlined text-xl">handshake</span>
            </div>
            <span className="flex items-center text-primary text-xs font-medium bg-primary/10 px-2 py-1 rounded-md border border-primary/20">
              Active
            </span>
          </div>
          <div>
            <p className="text-emerald-200/70 text-sm font-medium">Lobbyist Declarations</p>
            <p className="text-3xl font-bold text-primary mt-1 drop-shadow-[0_0_15px_rgba(245,159,10,0.4)]">142</p>
            <p className="text-xs text-emerald-400 mt-2">Verified in last 30 days</p>
          </div>
        </div>

        {/* RECENT VOTING FEED (2 cols wide) */}
        <div className="gemstone-card rounded-2xl p-6 xl:col-span-2 flex flex-col gap-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-300">how_to_vote</span>
              Recent Voting
            </h3>
            <button className="text-xs text-primary hover:text-amber-400 font-medium hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {/* Bill Item 1 */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/30 hover:bg-emerald-900/50 transition-colors group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-full bg-emerald-900 flex items-center justify-center shrink-0 border border-emerald-700/50 text-emerald-400">
                  <span className="material-symbols-outlined text-xl">energy_savings_leaf</span>
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">Atsinaujinančios energetikos įstatymas</p>
                  <p className="text-xs text-emerald-400/60">Bill #XIV-245 • Today, 10:30 AM</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium shrink-0">
                Passed
              </span>
            </div>
            {/* Bill Item 2 */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/30 hover:bg-emerald-900/50 transition-colors group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-full bg-emerald-900 flex items-center justify-center shrink-0 border border-emerald-700/50 text-emerald-400">
                  <span className="material-symbols-outlined text-xl">school</span>
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">Švietimo įstatymo pakeitimas</p>
                  <p className="text-xs text-emerald-400/60">Bill #XIV-248 • Yesterday</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium shrink-0">
                Pending
              </span>
            </div>
            {/* Bill Item 3 */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/30 hover:bg-emerald-900/50 transition-colors group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-full bg-emerald-900 flex items-center justify-center shrink-0 border border-emerald-700/50 text-emerald-400">
                  <span className="material-symbols-outlined text-xl">forest</span>
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">Miškų įstatymo pataisos</p>
                  <p className="text-xs text-emerald-400/60">Bill #XIV-230 • 2 Days ago</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium shrink-0">
                Rejected
              </span>
            </div>
          </div>
        </div>

        {/* TOP DELEGATES (Vertical list, 2 cols on desktop/xl) */}
        <div className="gemstone-card rounded-2xl p-6 xl:col-span-2 xl:row-span-2 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">award_star</span>
              Top Delegates
            </h3>
            <button className="size-8 flex items-center justify-center rounded-lg hover:bg-emerald-800/50 text-emerald-400 transition-colors">
              <span className="material-symbols-outlined text-sm">more_horiz</span>
            </button>
          </div>
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
            {topDelegates?.map((delegate) => (
              <Link key={delegate.mp.id} href={`/mp/${delegate.mp.id}`}>
                <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-900/30 to-transparent border border-emerald-800/30 hover:border-primary/30 transition-all group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <Avatar className="size-12 border-2 border-emerald-700 group-hover:border-primary transition-colors">
                      <AvatarImage src={delegate.mp.photoUrl || ""} className="object-cover" />
                      <AvatarFallback>{delegate.mp.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-bold text-white leading-tight">{delegate.mp.name}</p>
                      <p className="text-xs text-emerald-400 mt-0.5">{delegate.mp.party}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 bg-emerald-900/60 px-2 py-1 rounded-full border border-emerald-700">
                      <span className="text-xs font-bold text-emerald-100">{parseFloat(delegate.stats.accountabilityScore).toFixed(1)}</span>
                    </div>
                    <span className="text-[10px] text-emerald-500/60 mt-1 uppercase tracking-wider">Score</span>
                  </div>
                </div>
              </Link>
            ))}
            {!topDelegates && (
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/30 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-full bg-emerald-800" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-emerald-800 rounded" />
                        <div className="h-3 w-16 bg-emerald-800/50 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="w-full mt-4 py-3 rounded-xl bg-emerald-900/30 border border-emerald-800/50 text-emerald-300 text-sm font-medium hover:bg-emerald-800/50 hover:text-white transition-all">
            View All 141 Members
          </button>
        </div>

      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center border-t border-emerald-900/50 pt-6">
        <p className="text-xs text-emerald-500/40">© 2024 Skaidrus Seimas. Open Data Initiative. Built with transparency in mind.</p>
      </div>
    </DashboardLayout>
  );
}
