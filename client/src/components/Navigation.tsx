import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Home,
  FileText,
  Users,
  HelpCircle,
  LogOut,
  Search,
  Activity,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export function Navigation() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const getLoginUrl = () => {
    const redirectUrl = encodeURIComponent(window.location.href);
    return `/api/auth/login?redirect=${redirectUrl}`;
  };

  const navItems = [
    { href: "/", label: "STREAM", icon: Activity },
    { href: "/bills", label: "LOGS", icon: FileText },
    { href: "/mps", label: "NODES", icon: Users },
    { href: "/quiz", label: "SYNC", icon: HelpCircle },
  ];

  return (
    <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-fit">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-2 px-3 py-2 bg-black/60 backdrop-blur-3xl border border-[#00ffff]/20 rounded-full shadow-[0_0_30px_rgba(0,255,255,0.1)]"
      >
        {/* Cyber Logo */}
        <Link href="/">
          <div className="w-10 h-10 bg-[#ff00ff] rounded-full flex items-center justify-center cursor-pointer hover:rotate-180 transition-transform duration-700 shadow-[0_0_20px_rgba(255,0,255,0.4)]">
            <span className="text-black font-black text-xs">A4</span>
          </div>
        </Link>

        {/* Cyber Nav Items */}
        <div className="flex items-center gap-1 mx-4">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive =
              location === item.href ||
              (item.href !== "/" && location.startsWith(item.href));

            return (
              <Link key={item.href} href={item.href}>
                <button
                  className={`relative px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                    isActive
                      ? "text-[#00ffff]"
                      : "text-slate-500 hover:text-white"
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className="h-3 w-3" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="cyber-nav-pill"
                      className="absolute inset-0 bg-[#00ffff]/10 border border-[#00ffff]/30 rounded-full"
                    />
                  )}
                </button>
              </Link>
            );
          })}
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-3 px-4 border-l border-white/10 ml-2">
          <div className="flex flex-col items-end">
            <span className="text-[7px] text-slate-600 font-black uppercase tracking-widest">
              System_Status
            </span>
            <span className="text-[8px] text-[#ccff00] font-black uppercase tracking-tighter">
              Operational
            </span>
          </div>
          <div className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
        </div>

        {/* Auth Module */}
        <div className="flex items-center gap-2 ml-4">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#ff00ff]/10 border border-[#ff00ff]/30 flex items-center justify-center text-[10px] font-black text-[#ff00ff]">
                {user.name?.[0] || "U"}
              </div>
              <button
                onClick={() => logout()}
                className="text-slate-600 hover:text-[#ff00ff] transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => (window.location.href = getLoginUrl())}
              className="px-6 py-2 bg-[#00ffff] text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-white transition-colors"
            >
              UP_LINK
            </button>
          )}
        </div>
      </motion.div>
    </nav>
  );
}
